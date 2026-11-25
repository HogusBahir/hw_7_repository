// NEW

import express from "express";
import pg from "pg";

const app = express();
const port = 3000; 

const db = new pg.Client({
    user: "postgres",
    password: "Crashy@101",
    host: "localhost",  
    port: 5432,
    database: "hw_pagimation",
});

db.connect();

app.use(express.static("public"));
app.set("view engine", "ejs");

const limit = 10;

//// // // // // // // // // // // // // // // ////   

app.get("/", async (req, res)=>{
    console.log("Retrieving data from the CUSTOMERS table...");

    try{
        const page = Number(req.query.page) || 1;
        
        const offset = (page - 1) * limit;
        
        const countRes = await db.query("SELECT count(*) FROM customers");
        const totalCustomers = Number(countRes.rows[0].count);
        const totalPages = Math.ceil(totalCustomers / limit);
        
        const customerRes = await db.query(
            `SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]);

        const revenueRes = await db.query("SELECT sum(saleamount) FROM sales");
    
        const totalRevenue = Number(revenueRes.rows[0].sum || 0);

        const salesRes = await db.query(`
        SELECT products.name, sales.quantity, sales.saleamount FROM sales
        LEFT JOIN products ON sales.productid = products.id
        ORDER BY sales.id ASC`);

        const ordersRes = await db.query("SELECT count(quantity) FROM orders");
        const totalOrders = Number(ordersRes.rows[0].count || 0);

        const issuesCountRes = await db.query(
        "SELECT count(id) FROM alerts WHERE type = 'issues'");
        
        const issuesListRes = await db.query( "SELECT * FROM alerts WHERE type = 'issues'");

        const notifCountRes = await db.query( "SELECT count(id) FROM alerts WHERE type = 'notifications'" );
        const notifListRes = await db.query( "SELECT * FROM alerts WHERE type = 'notifications'" );
        const tasksListRes = await db.query( "SELECT * FROM alerts WHERE type = 'tasks'" );

        
        res.render("index.ejs", {
            totalCustomers,
            customers: customersRes.rows,
            currentPage: page,
            totalPages,
            totalRevenue,
            sales: salesRes.rows,
            totalOrders,
            issuesCount: Number(issuesCountRes.rows[0].count || 0),
            issuesList: issuesListRes.rows,
            notifCount: Number(notifCountRes.rows[0].count || 0),
            notifList: notifListRes.rows,
            tasksList: tasksListRes.rows,
            });
    
        } catch(err){
            res.status(500).json({
            error: "Internal server error",
            message: err.message
            });
}});

    //NEW
app.listen(port, () => {
console.log(`Server running on port ${port}`);
});

