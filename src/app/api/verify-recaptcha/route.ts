import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "缺少reCAPTCHA token" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("未配置 RECAPTCHA_SECRET_KEY 环境变量");
      return NextResponse.json(
        { success: false, message: "服务器配置错误" },
        { status: 500 }
      );
    }

    // 验证reCAPTCHA token
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const response = await fetch(verifyUrl, {
      method: "POST",
      body: formData.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();
    console.log("reCAPTCHA验证响应:", data);

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      console.error("reCAPTCHA验证失败:", data["error-codes"]);
      return NextResponse.json(
        {
          success: false,
          message: "reCAPTCHA验证失败",
          details: data["error-codes"],
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("验证reCAPTCHA时出错:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误" },
      { status: 500 }
    );
  }
}
