require("dotenv").config();

const { NODE_ENV, SMS_API_KEY } = process.env;

module.exports.sendVerificationSms = async function sendVerificationSms(
  countryCode,
  phone,
  otpCode,
) {
  const cleanCountryCode = countryCode.replace("+", "");
  const fullNumber = `${cleanCountryCode}${phone}`;
  const messageText = `Tu codigo de verificacion para I Love Salads es: ${otpCode}. Expira en 10 minutos.`;

  if (NODE_ENV !== "production") {
    console.log("------------------------------------------------");
    console.log(`[SIMULACIÓN SMS] Enviado a: ${fullNumber}`);
    console.log(`[CONTENIDO]: ${messageText}`);
    console.log("------------------------------------------------");
    return Promise.resolve(true);
  }

  // 🚀 SI ESTAMOS EN PRODUCCIÓN, se dispara el envío real usando fetch nativo
  const response = await fetch("https://api.smsmasivos.com.mx/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SMS_API_KEY,
    },
    body: JSON.stringify({
      numbers: phone,
      message: messageText,
      sender: "I Love Salads",
      country_code: cleanCountryCode,
    }),
  });

  const data = await response.json();
  // console.log(data);
};
