import { supabase } from "../SupabaseClient";

const loginUser = async (email: string, password: string) => {
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.log("Login error:", error.message);
            return { error: error.message }
        }

    } catch (err) {
        console.log("Unexpected error:", err);
        return { error: "Somthing went wrong" };
    }

};

export default loginUser;