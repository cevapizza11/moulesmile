// ============================================================
// Cloud Function — Moule & Smile
// Déclenche une vraie notification push (FCM) dès qu'un document
// est ajouté dans la collection "notifications" par la caisse.
//
// INSTALLATION (à faire une seule fois) :
// 1. npm install -g firebase-tools
// 2. firebase login
// 3. Dans le dossier du projet : firebase init functions
//    (choisir le projet "commandemoulesmile", langage JavaScript)
// 4. Remplacer le contenu de functions/index.js par ce fichier
// 5. cd functions && npm install firebase-admin firebase-functions
// 6. firebase deploy --only functions
// ============================================================

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.envoyerNotificationCommande = functions.firestore
  .document("notifications/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const docId = context.params.docId; // format: "table_12"
    const tableNum = docId.replace("table_", "");

    // Récupérer le token push enregistré pour cette table
    const tokenDoc = await admin
      .firestore()
      .collection("push_tokens")
      .doc(docId)
      .get();

    if (!tokenDoc.exists) {
      console.log(`Aucun token push pour la table ${tableNum} — bandeau in-app seul`);
      return null;
    }

    const token = tokenDoc.data().token;
    if (!token) return null;

    const message = {
      token: token,
      notification: {
        title: "🐚 Moule & Smile",
        body: data.message || "Un serveur s'occupe de votre commande !",
      },
      webpush: {
        fcmOptions: {
          link: "/index.html",
        },
        notification: {
          icon: "/icon-192.png",
          vibrate: [300, 100, 300, 100, 300],
        },
      },
    };

    try {
      await admin.messaging().send(message);
      console.log(`✅ Notification push envoyée à la table ${tableNum}`);
    } catch (error) {
      console.error(`❌ Erreur envoi push table ${tableNum}:`, error.message);
      // Si le token n'est plus valide, on le supprime pour éviter les erreurs futures
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        await admin.firestore().collection("push_tokens").doc(docId).delete();
      }
    }

    return null;
  });
