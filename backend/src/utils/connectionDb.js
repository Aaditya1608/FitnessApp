import pool from "../config/db.js";
function connectDB(){
    pool.query('SELECT NOW()',(err,res)=>{
        if (err) {
            console.error('Database Connection failed: ',err.message);
        }
        else{
            const result = res.rows[0].now
            const dte = `${result.getDate()}-${result.getMonth()+1}-${result.getFullYear()}`
            console.log('Connected to Neon PostgreSQL DB! ',dte);
        }
    });
}

export default connectDB;