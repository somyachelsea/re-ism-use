const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const app = express();
const Product = require("./db/Product");
app.use(express.json());
app.use(cors());
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";




const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token) {
        token = token.split(' ')[1];
        Jwt.verify(token, jwtKey, (err, valid) => {
            if (err) {
                res.status(401).send({ result: "Please proivde valid token !" });
            } else {
                next();
            }
        })
    } else {
        res.status(403).send({ result: "Please add token with header!" });
    }
}


app.post("/register", async (req, res) => {
    let newUser = new User(req.body);
    let result = await newUser.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ result: "something went wrong, please try after sometime" })
        }
        res.send({ result, auth: token });
    })
})

app.post("/login", async (req, res) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password");
        console.log(user);
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "something went wrong, please try after sometime" })
                }
                res.send({ user, auth: token });
            })
        }
        else res.send({ result: "no user found!" });
    }
    else res.send({ result: "no user found!" });
})

app.post("/add-product", verifyToken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
})

app.get("/products", verifyToken, async (req, res) => {
    let products = await Product.find();
    if (products.length) {
        res.send(products);
    } else {
        res.send({ result: "No Products found!" });
    }
})

app.delete("/product/:id", verifyToken, async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id });
    res.send(result);
})

app.get("/product/:id", verifyToken, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    } else {
        res.send({ result: "No such record found!" });
    }
})

app.put("/product/:id", verifyToken, async (req, res) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    res.send(result);
})



app.get("/search/:key", verifyToken, async (req, res) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }

        ]
    })
    res.send(result);
})



app.listen(5000);

