import app from "./src/app.js";
import connectDB from "./src/utils/connectionDb.js";
const PORT = process.env.PORT || 3000;

app.listen(PORT,"0.0.0.0",()=>{
    console.log(`Backend is running in PORT ${PORT}`)
})

connectDB();