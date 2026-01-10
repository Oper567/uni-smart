import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export const useRegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    identificationNo: "",
    role: "LECTURER",
  });

  const validateMatric = (id: string) => /^[a-z]{3}\d{7}$/i.test(id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "info", message: "Verifying details..." });

    // Validation
    if (formData.role === "STUDENT" && !validateMatric(formData.identificationNo)) {
      setLoading(false);
      return setStatus({ type: "error", message: "Invalid Matric Format (e.g., cmp2412276)" });
    }

    try {
      // Map to backend fields: staffId or matricNo
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        ...(formData.role === "LECTURER" 
          ? { staffId: formData.identificationNo } 
          : { matricNo: formData.identificationNo }
        ),
      };

      await axios.post("http://localhost:5001/api/auth/register", payload);
      setStatus({ type: "success", message: "Account created! Redirecting..." });
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setLoading(false);
      setStatus({ 
        type: "error", 
        message: error.response?.data?.error || "Registration failed." 
      });
    }
  };

  return { formData, setFormData, loading, status, handleSubmit };
};