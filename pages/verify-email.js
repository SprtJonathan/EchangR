import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const EmailVerification = () => {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState("Vérification en cours...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (token) {
          const response = await fetch(
            `/api/users/verify-email?token=${token}`
          );

          if (response.status === 200) {
            setStatus("Votre email a été vérifié avec succès !");
          }
        }
      } catch (error) {
        setStatus(
          "Échec de la vérification de l'email. Le lien est peut-être expiré ou invalide."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div>
      <h1>Vérification de l'email</h1>
      <p>{status}</p>
    </div>
  );
};

export default EmailVerification;
