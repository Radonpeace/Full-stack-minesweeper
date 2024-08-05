
exports.profilePage = async (req, res) => {
    const userId = req.userId;
    const userData = {};
    var sql = 'SELECT g.timeTaken,g.result,u.username,u.email FROM gameStats g JOIN users u ON g.userId = u.id WHERE g.userId = ?'
    const db = req.db;
    userData.wins = 0;
    userData.loses = 0;
    userData.gamesPlayed = 0;
    userData.lowestTime = Infinity;
    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, [userId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    
        // Now you can use results here
        // console.log(results)
        userData.gamesPlayed = results.length;
        userData.username = results[0].username;
        userData.email = results[0].email;
        for(let i = 0; i < results.length; i++) {
            if(results[i].result === 'WIN') {
                userData.wins++;
                if(results[i].timeTaken < userData.lowestTime) {
                    userData.lowestTime = results[i].timeTaken;
                }
            }
            else userData.loses++;
        }
        res.render('profile', {user: userData});
    } catch (err) {
        // Handle error here
        console.error(err);
    }
}

exports.gameOver = (req, res) => {
    const {time, gameWon} = req.body;
    console.log("from server",time, gameWon);
    const db = req.db;
    const userId = req.userId;
    // console.log(userId);
    const result = (gameWon === 'true' ? 'WIN' : 'LOSE')
    const sql = 'INSERT INTO gameStats (userId,timeTaken,result) VALUES(?,?,?)';
    db.query(sql, [userId, time, result], (err, result) => {
        if(err) throw err;
        console.log(result);
        res.status(200).redirect('/');
    });
}