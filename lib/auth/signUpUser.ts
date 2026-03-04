import { supabase } from "../SupabaseClient";

const signUpUser = async (name: string, email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      console.log("Signup error:", error.message);
      return { error: error.message };
    }

    return { data };

  } catch (err) {
    console.log("Unexpected error:", err);
    return { error: "Something went wrong" };
  }
};

export default signUpUser;