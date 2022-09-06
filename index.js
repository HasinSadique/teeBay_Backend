const client = require("./connection");
const express = require("express");
const cors = require("cors");
const { Client } = require("pg");
const app = express();

const axios = require("axios");
const e = require("express");

const port = "3302";

app.listen(port, () => {
  console.log("Server is now listening at port: " + port);
});

app.use(cors());
app.use(express.json({ extended: false }));

client.connect();

// console.log(client.database);

app.get("/", (req, res) => {
  let query = `SELECT * FROM public."Products_Table"`;

  // res.send("Hello developer welcome to teebay Backend.");
  client.query(query, (err, result) => {
    if (!err) {
      // res.send(result.rows);
      console.log(result.rows[0].Categories);
    } else {
      console.log(err);
    }
  });
  client.end;
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, address, email, phoneNumber, password } =
    req.body;

  console.log(req.body);

  let queryInsertUser = `INSERT INTO public."Users"(
        "First_Name", "Last_Name", "Email", "Address", "Phone_Number", "Password")
        VALUES ('${firstName}', '${lastName}', '${email}', '${address}', '${phoneNumber}', '${password}');`;
  client.query(queryInsertUser, (err, result) => {
    if (!err) {
      res.send({ success: true });
    } else {
      console.log(err);
      res.send({ success: false, msg: err });
    }
  });
  client.end;
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  //   console.log(req.body);

  let queryCheckEmailExist = `SELECT * FROM public."Users" Where "Email"='${email}'`;
  client.query(queryCheckEmailExist, (err, result) => {
    if (!err) {
      if (result.rows[0].Email == email) {
        if (result.rows[0].Password == password) {
          //   console.log(result.rows[0].UID);
          res.send({ msg: "Success", UID: result.rows[0].UID });
        } else {
          res.errored;
          res.send({ msg: "Password mismatch" });
        }
      } else {
        res.send({ msg: "Email does not exist." });
      }
    } else {
      res.send({ msg: err });
    }
  });
});

app.post("/add-product", async (req, res) => {
  const { UID, Title, Categories, Description, Price, Rent, RentOption } =
    req.body;
  console.log(req.body.Categories);
  // Categories.map((category) => console.log(category));
  //categories array insert example: '{"hello", "gello", "khelo"}'

  let queryInsertProduct = `INSERT INTO public."Products_Table"(
        "ProductOwnerID", "Title", "Description", "Price", "Rent", "Categories", "Rent_Option", "Rent_Status")
        VALUES ('${UID}', '${Title}', '${Description}', '${Price}', '${Rent}', '${Categories}', '${RentOption}', 'false');`;

  client.query(queryInsertProduct, (err, result) => {
    if (!err) {
      res.send({ success: true });
    } else {
      console.log(err);
    }
  });
  client.end;
});

app.patch("/edit-product", (req, res) => {
  const { PID, Title, Description, Price, Rent, Categories, Rent_Option } =
    req.body;
  console.log(req.body);

  let queryUpdateProduct = `UPDATE public."Products_Table"
	SET "Title"='${Title}', "Description"='${Description}', "Price"='${Price}', "Rent"='${Rent}', "Categories"='${Categories}', "Rent_Option"='${Rent_Option}'
	WHERE "PID"='${PID}';`;

  client.query(queryUpdateProduct, (err, result) => {
    if (!err) {
      if (result.command == "UPDATE" && result.rowCount == 1) {
        res.send({ msg: "Updated Successfully", Success: true });
      } else {
        res.send({ msg: "Update not successfull", Success: false });
      }
    } else {
      console.log("Error: >> ", err);
    }
  });
});

app.get("/all-products", async (req, res) => {
  let query = `SELECT * FROM public."Products_Table"`;
  client.query(query, (err, result) => {
    if (!err) {
      res.send(result.rows);
      // console.log(result.rows[0].Categories);
    } else {
      console.log(err);
    }
  });
  client.end;
});

app.get("/get-product/:pid", async (req, res) => {
  const pid = req.params.pid;
  console.log("pid: ", pid);
  let queryGetProduct = `SELECT * FROM public."Products_Table" WHERE "PID"=${pid}`;

  client.query(queryGetProduct, (err, result) => {
    if (!err) {
      res.send(result.rows);
    }
  });
});

app.get("/getmy-products/:email", async (req, res) => {
  const email = req.params.email;
  console.log("Email: > ", email);
  let queryGetUserID = `SELECT "UID" FROM public."Users" Where "Email"='${email}';`;

  client.query(queryGetUserID, (err, result) => {
    if (!err) {
      // console.log(result.rows[0].UID);
      let queryGetMyProducts = `SELECT * FROM public."Products_Table" WHERE "ProductOwnerID"='${result?.rows[0]?.UID}';`;

      client.query(queryGetMyProducts, (err2, result2) => {
        if (!err2) {
          res.send(result2?.rows);
        } else {
          console.log(err2);
        }
      });
    } else {
      console.log(err);
    }
  });
});

app.delete("/delete-product/:pid", async (req, res) => {
  const pid = req.params.pid;
  console.log("Deleting pid: ", pid);

  let queryDeleteProduct = `DELETE FROM public."Products_Table"
	WHERE "PID"='${pid}';`;

  client.query(queryDeleteProduct, (err, result) => {
    if (!err) {
      res.send({ msg: "Deleted successfully", deleted: true });
    } else {
      console.log(err);
    }
  });
});

app.patch("/buy-product", async (req, res) => {
  const { PID, Title, CurrentUserID, ProductOwnerID, Price } = req.body;

  let queryInsertBuyingInfo = `INSERT INTO public."Buying_Table"(
	"ProductTitle", "SellerID", "BuyerID", "Total_Amount")
	VALUES ('${Title}', '${ProductOwnerID}', '${CurrentUserID}', '${Price}');`;

  console.log(req.body);

  client.query(queryInsertBuyingInfo, (err, result) => {
    if (!err) {
      let queryDeleteProductInfo = `DELETE FROM public."Products_Table"
  	WHERE "PID"='${PID}';`;

      client.query(queryDeleteProductInfo, (err2, result2) => {
        if (!err) {
          console.log(result2);
          if (result2.rowCount == 1 && result2.command == "DELETE") {
            res.send({ msg: "Product Bought", Success: true });
          } else {
            res.send({ msg: "Cannot Buy Product", Success: false });
          }
        } else {
          console.log("Err1: ", err2);
        }
      });
    } else {
      console.log("Err1: ", err);
    }
  });
});

app.post("/rent-product", async (req, res) => {
  const {
    PID,
    CurrentUserID,
    ProductOwnerID,
    from,
    to,
    Rent_Amount,
    Rent_Option,
  } = req.body;
  console.log(req.body);

  //   let queryInsertRentinfo = `INSERT INTO public."Rent_Table"(
  // 	"PID", "OwnerID", "RenterID", "From", "To", "Rent_Amount", "Rent_Option")
  // 	VALUES ('${PID}', '${ProductOwnerID}', '${CurrentUserID}', '${from}', '${to}', '${Rent_Amount}', '${Rent_Option}');`;

  let queryinsertRentInfo = `INSERT INTO public."Rent_Table"
           ("PID", "OwnerID", "RenterID", "From", "To", "Rent_Amount", "Rent_Option") 
  VALUES ('${PID}', '${ProductOwnerID}', '${CurrentUserID}', '${from}', '${to}', '${Rent_Amount}', '${Rent_Option}')
  RETURNING "RentID";`;

  client.query(queryinsertRentInfo, (err, result) => {
    if (!err) {
      if (result.rows[0].RentID > 0) {
        console.log("rent ID: > ");
        let queryUpdateRentStatus = `UPDATE public."Products_Table" SET "Rent_Status"='true', "RentID"='${result.rows[0].RentID}' WHERE "PID"='${PID}';`;

        client.query(queryUpdateRentStatus, (err, result2) => {
          if (!err) {
            console.log(result2);
            if (result2.command == "UPDATE" && result2.rowCount == 1) {
              res.send({ msg: "Product Rented.", Success: true });
            } else {
              res.send({ msg: "Product not rented.", Success: false });
            }
          } else {
            console.log(err);
          }
        });
        // res.send({ msg: "Product Rented.", Success: true });
      } else {
        res.send({ msg: "Cannot Rent Product", Success: false });
      }
    } else {
      console.log(err);
      //   res.send({ msg: err, Success: false });
    }
  });
});

app.get("/sold-products/:uid", async (req, res) => {
  const currentUserId = req.params.uid;

  let queryGetMySoldProducts = `SELECT * FROM public."Buying_Table" WHERE "SellerID"='${currentUserId}'`;

  client.query(queryGetMySoldProducts, (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/bought-products/:uid", async (req, res) => {
  const currentUserId = req.params.uid;

  let queryGetMyBoughtProducts = `SELECT * FROM public."Buying_Table" WHERE "BuyerID"='${currentUserId}'`;

  client.query(queryGetMyBoughtProducts, (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/products-on-rent/:uid", async (req, res) => {
  const currentUserId = req.params.uid;

  let queryGetMyProductsOnRent = `SELECT * FROM public."Rent_Table" Where "OwnerID"='${currentUserId}';`;

  client.query(queryGetMyProductsOnRent, (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      console.log(err);
    }
  });
});
app.get("/products-borrowed/:uid", async (req, res) => {
  const currentUserId = req.params.uid;

  let queryGetMyBorrowedProducts = `SELECT * FROM public."Rent_Table" Where "RenterID"='${currentUserId}';`;
  client.query(queryGetMyBorrowedProducts, (err, result) => {
    if (!err) {
      res.send(result.rows);
    } else {
      console.log(err);
    }
  });
});
