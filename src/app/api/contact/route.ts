



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


// gmail transporter
    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//zoho transporter
// const transporter = nodemailer.createTransport({
//   host: "smtp.zoho.com",
//   port: 587,
//   secure: false, // use TLS
//   auth: {
//     user: process.env.EMAIL_USER, // your Zoho email
//     pass: process.env.EMAIL_PASS, // your Zoho password (or app password)
//   },
// });


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
        <h2 style="color:#4D148C;">Shipment Update</h2>
        <p>${message}</p>

        <div style="margin-top:20px;">
          <a href="${link}" 
             style="background:#4D148C; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
             Proceed
          </a>
        </div>

        <p>Best Regards,</p>
        <p style="margin-top:30px; font-size:12px; color:#777;">
          Shipment Update
        </p>
      </div>
    `;

    // 📤 Send email
    const info = await transporter.sendMail({
      from: `"apodelibrateddelivery.com" <${process.env.EMAIL_USER}>`,
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






// import { NextResponse } from "next/server";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type",
// };

// // OPTIONS handler
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 200,
//     headers: corsHeaders,
//   });
// }

// // POST handler
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email, message, link } = body;

//     if (!email || !message || !link) {
//       return NextResponse.json(
//         { error: "All fields are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const htmlTemplate = `
//       <div style="font-family: Arial; padding:20px;">
//         <h2 style="color:#4D148C;">Shipment Update</h2>
//         <p>${message}</p>

//         <a href="${link}" 
//            style="background:#4D148C; color:white; padding:10px 20px; text-decoration:none;">
//            Proceed
//         </a>
//       </div>
//     `;

//     // 🔥 Send email via Brevo API directly
//     const response = await fetch("https://api.brevo.com/v3/smtp/email", {
//       method: "POST",
//       headers: {
//         "api-key": process.env.BREVO_API_KEY!,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         sender: {
//           name: "Apode Delivery",
//           email: "globaldeliveryorg242@gmail.com", // MUST be verified in Brevo
//         },
//         to: [
//           {
//             email: email,
//           },
//         ],
//         subject: "Shipment Update",
//         htmlContent: htmlTemplate,
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("❌ Brevo error:", data);

//       return NextResponse.json(
//         { error: data },
//         { status: response.status, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         data,
//       },
//       { headers: corsHeaders }
//     );

//   } catch (error: any) {
//     console.error("❌ SERVER ERROR:", error);

//     return NextResponse.json(
//       { error: error.message || "Internal server error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }