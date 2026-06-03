fetch("http://localhost:3000/api/test-key").then(r=>r.text()).then(t=>console.log(t)).catch(console.error);
