// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function OPTIONS() {
//   return NextResponse.json({}, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type',
//     },
//   });
// }

// export async function POST(req: Request) {
//   const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type',
//   };

//   try {
//     const { name, email, phone, message, recipientEmail, websiteName } = await req.json();

//     if (!recipientEmail || !websiteName) {
//       return new NextResponse(JSON.stringify({ success: false, error: 'Recipient email and website name are required.' }), {
//         status: 400,
//         headers: {
//           'Content-Type': 'application/json',
//           ...corsHeaders,
//         },
//       });
//     }

//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Contact Form - ${websiteName}" <${process.env.EMAIL_USER}>`,
//       to: recipientEmail,
//       subject: `New message from ${name}`,
//       html: `
//         <h2>New Contact Message</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phone}</p>
//         <p><strong>Message:</strong><br>${message}</p>
//       `,
//     });

//     return new NextResponse(JSON.stringify({ success: true }), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         ...corsHeaders,
//       },
//     });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return new NextResponse(JSON.stringify({ success: false, error: 'Email failed to send' }), {
//       status: 500,
//       headers: {
//         'Content-Type': 'application/json',
//         ...corsHeaders,
//       },
//     });
//   }
// }



import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 🔥 CHANGE THIS TO YOUR FRONTEND URL
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 👈 React app URL
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ✅ Handle preflight (VERY IMPORTANT)
export async function OPTIONS() {
  console.log("⚡ OPTIONS request received");

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// ✅ Main POST handler
export async function POST(req: Request) {
  try {
    // 🔍 Read body
    const body = await req.json();
    console.log("📩 Incoming request body:", body);

    const { email, message, link } = body;

    // ❌ Validate
    if (!email || !message || !link) {
      console.log("❌ Missing fields");

      return new NextResponse(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Create transporter
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.gmail.com",
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    // 🔍 Verify SMTP connection
    try {
      await transporter.verify();
      console.log("✅ SMTP server is ready");
    } catch (verifyError) {
      console.error("❌ SMTP VERIFY ERROR:", verifyError);

      return new NextResponse(
        JSON.stringify({ error: "Email server connection failed" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // ✅ Email HTML
    const htmlTemplate = `
      <div style="font-family: Arial; padding:20px;">
      <!-- LOGO --> 
      <div style="text-align:center; margin-bottom:20px;"> 
      <img src="https://res.cloudinary.com/deeqakcdx/image/upload/v1774674824/download_usjv3y.png" width="120" />
      </div>
        <h2 style="color:#4D148C;">Fedex Shipment Update</h2>
        <p>${message}</p>

        <div style="margin-top:20px;">
          <a href="${link}" 
             style="background:#4D148C; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
             Proceed
          </a>
        </div>

        <p>Best Regards,</p>
        <p style="margin-top:30px; font-size:12px; color:#777;">
          Fedex Deliveries
        </p>
      </div>
    `;

    // 📤 Send email
    const info = await transporter.sendMail({
      from: `"Fedex Deliveries" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Shipment Update",
      html: htmlTemplate,
    });

    console.log("📨 Email sent successfully:", info.messageId);

    return new NextResponse(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ BACKEND ERROR:", error);

    return new NextResponse(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}