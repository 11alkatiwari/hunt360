// if (process.env.NODE_ENV !== 'PRODUCTION') {
//     const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8080';

//     setInterval(() => {
//         const timestamp = new Date().toISOString();
//         fetch(`${SERVER_URL}/health`)
//             .then(res => {
//                 console.log(`[${timestamp}] :: Keep-alive ping sent. Status: ${res.status}`);
//             })
//             .catch(err => {
//                 console.error(`[${timestamp}] :: Keep-alive ping failed:`, err.message);
//             });
//     }, 1 * 60 * 1000);
// }


const isProduction = process.env.NODE_ENV === "PRODUCTION";

const SERVER_URL = isProduction
  ? process.env.SERVER_URL || "https://hunt360-3.onrender.com"
  : "http://localhost:8080"; // 👈 match your Express server port

if (isProduction) {
  setInterval(() => {
    const timestamp = new Date().toISOString();

    fetch(`${SERVER_URL}/health`)
      .then((res) => {
        console.log(`[${timestamp}] :: Keep-alive ping sent. Status: ${res.status}`);
      })
      .catch((err) => {
        console.error(`[${timestamp}] :: Keep-alive ping failed:`, err.message);
      });
  }, 1 * 60 * 1000); // every 1 minute
}
