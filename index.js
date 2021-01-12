const express = require('express'); // importa o express
const server = express(); // variavel para chamar a função express
server.use(express.json()); // faz com que o express entenda JSON

const mariadb = require('mariadb'); // configura o banco
require('dotenv').config(); // importa o dotenv

const pool = mariadb.createPool({
    host: process.env.DB_HOST, // O host do banco.
    user: process.env.DB_USER, // Um usuário do banco.
    password: process.env.DB_PWD, // A senha do usuário.
    database: process.env.DB_NAME // A base de dados a qual a aplicação irá se conectar
}); // conecta com o banco

pool.getConnection().then(conn => {
    console.log("connected ! connection id is " + conn.threadId);
}).catch(err => {
    console.log("not connected due to error: " + err);
}); // retorna status da conexao

server.use((req, res, next) => { // server.use cria o middleware global
    console.time('Request'); // marca o início da requisição
    console.log(`Método: ${req.method}; URL: ${req.url}; `); // retorna qual o método e url foi chamada
    next(); // função que chama as próximas ações 
    console.log('Complet'); // será chamado após a requisição ser concluída
    console.timeEnd('Request'); // marca o fim da requisição
});

function checkFollowerExists(req, res, next) {
    if (!req.body.name) {
        return res.status(400).json({ error: 'Follower name is required' });
        // middleware local que irá checar se a propriedade name foi infomada, 
        // caso negativo, irá retornar um erro 400 - BAD REQUEST 
    }
    return next(); // se o nome for informado corretamente, a função next() chama as próximas ações
}

function checkFollowerIndex(req, res, next) {
    if (!req.params.index) {
        return res.status(204).json({ error: 'Follower does not exists' });
    } // checa se veio index
    return next();
}

server.get('/teste', (req, res) => {
    return res.json({ message: 'Hello World' });
}) // Cria a rota /teste com o método GET.

server.get('/followers', (req, res) => {
    var sql = "SELECT * FROM seguidores";
    pool.query(sql)
        .then(rows => {
            console.log(rows);
            return res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
}) // rota para listar todos os seguidoresW

server.get('/followers/:index', checkFollowerIndex, (req, res) => {
    var sql = "SELECT * FROM seguidores WHERE id = " +  req.params.index;
    pool.query(sql)
        .then(rows => {
            console.log(rows);
            return res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
}) // retorna um seguidor

server.post('/followers', checkFollowerExists, (req, res) => {
    var sql = "INSERT INTO seguidores(nome) VALUE (?)";
    var values = [req.body.name];
    pool.query(sql, [values])
        .then(rows => {
            console.log(rows);
            return res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
}) // retorna a informação da variável followers

server.put('/followers/:index', checkFollowerIndex, checkFollowerExists, (req, res) => {
    var sql = "UPDATE seguidores SET nome = ? WHERE id = ?";
    var values = [req.body.name, req.params.index];
    pool.query(sql, values)
        .then(rows => {
            console.log(rows);
            return res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
}); // retorna novamente os followers atualizados após o update

server.delete('/followers/:index', checkFollowerIndex, (req, res) => {
    var sql = "DELETE FROM seguidores WHERE id = ?";
    var values = [req.params.index];
    pool.query(sql, [values])
        .then(rows => {
            console.log(rows);
            return res.json(rows);
        })
        .catch(err => {
            console.log(err);
        });
}); // retorna os dados após exclusão

server.listen(3000); // seta porta 3000 pro servidor localhost