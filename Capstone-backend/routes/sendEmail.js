const express = require("express");
const sendEmail = express.Router();
const nodemailer = require("nodemailer");
const Usersmodel = require("../models/Usersmodel");
const Ticketmodel = require("../models/Ticketsmodel");
const bodyParser = require("body-parser");
require("dotenv").config();

sendEmail.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: "pro.turbo-smtp.com",
  port: 587,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});


sendEmail.post("/sendEmail", async (req, res) => {
   const {ticketId, senderEmail, message} = req.body;

   if(!ticketId || !senderEmail || !message){
    return res.status(400)
    .send({
        statusCode:400,
        message:"Ticket ID, sender email, and message are required"
    });
}

try {
    
    const ticket = await Ticketmodel.findById(ticketId);
    if(!ticket){
        return res.status(404)
        .send({
            statusCode:404,
            message:"Ticket not found"
        });
    }

    const user = await Usersmodel.findOne({email:senderEmail});
    if(!user){
        return res.status(404)
        .send({
            statusCode:404,
            message:"User not found"
        });
    }

    if(user.role !== "admin" && user.role !== "technician"){
        return res.status(403)
        .send({
            statusCode:403,
            message:"You do not have permission to respond to this ticket"
        });
    } 

    const mailOptions = {
        from: senderEmail,
        to: "primavoltaqui2@gmail.com",
        subject: `Ticket ${ticket.title}`,
        text: message,
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200)
    .send({
        statusCode:200,
        message:"Email sent successfully",
        info
    });

} catch (error) {
    res.status(500)
    .send({
        statusCode:500,
        message:"Email not sent successfully"
    });
}
});

module.exports = sendEmail;