const { supabase } = require("./supabaseClient");

async function main() {
  try {
    const email = "test@test.com"; // Insert test login here
    const password = "testpass";

    // 1️⃣ Login user
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      console.error("Login error:", loginError.message);
      return;
    }

    console.log("Login success! User:", loginData.user.id);

    // 2️⃣ Fetch example table
    const { data: portfolios, error: fetchError } = await supabase
      .from("portfolios")
      .select("*");

    if (fetchError) {
      console.error("Fetch error:", fetchError.message);
    } else {
      console.log("Portfolios:", portfolios);
    }

    // 3️⃣ Sign out → should block RLS
    await supabase.auth.signOut();
    console.log("Signed out. Trying to fetch again...");

    const { data: portfoliosAfterLogout } = await supabase
      .from("portfolios")
      .select("*");

    console.log(
      "After logout (should be denied or empty):",
      portfoliosAfterLogout
    );
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

main();
