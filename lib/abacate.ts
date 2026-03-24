'use server'

const apiKey = process.env.ABACATE_PAY_API_KEY;

export type PaymentMethod = "PIX_QRCODE";

async function createPayment(amount: number, method: PaymentMethod) {
  if (!apiKey) {
    throw new Error("ABACATE_PAY_API_KEY is not set in the environment.");
  }

  const response = await fetch(
    "https://api.abacatepay.com/v2/transparents/create",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, method }),
    },
  );


  console.log('response: ',response);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AbacatePay API error: ${response.status} ${text}`);
  }

  return response.json();
}

export { createPayment };