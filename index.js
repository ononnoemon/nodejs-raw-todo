const http = require('http');
const path = require('path');
const fs = require('fs');
const { json } = require('stream/consumers');

const filePath = path.join(__dirname, "/data.json");

const server = http.createServer((req, res) => {

    const url=new URL(req.url,`http://${req.headers.host}`)
   // console.log(url)
    const pathname=url.pathname;
    console.log(req.method, req.url);
    //Get Todos
    if (req.url === "/todos" && req.method === "GET") {
        fs.readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                return res.end("Internal Server Error");
            }
            console.log('Successfully Data Read');
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(data);
        });
    } 
    
    //create todos
    else if (req.url === "/todos/create-todo" && req.method === "POST") {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
            console.log('inner:', data);
        });

        req.on("end", () => {
            const newData = JSON.parse(data);
            const allData=fs.readFileSync(filePath,'utf-8')
            const parseAllData=JSON.parse(allData)
            console.log(parseAllData)
            parseAllData.push(newData)
            console.log(parseAllData)
            fs.writeFileSync(filePath,JSON.stringify(parseAllData),'utf-8')
            res.end(JSON.stringify(newData))
            // res.writeHead(201, { "Content-Type": "application/json" });
            // res.end(JSON.stringify({ message: "Todo created", todo: parsed }));
        });
    }
    //Get Single Todo
    else if(pathname==='/todo' && req.method==='GET'){
        
        const title=url.searchParams.get('title')
       // console.log(title)
        const allData=fs.readFileSync(filePath,'utf-8')
        const parseAllData=JSON.parse(allData)
        const result=parseAllData.find(item=>item.title===title)
        const stringifyResult=JSON.stringify(result)
         res.writeHead(200, { "Content-Type": "application/json" });
            res.end(stringifyResult);
           
    }
//updat todo
    else if(pathname==="/todos/update-todo" && req.method==="PATCH"){
       let data="";
        req.on("data",(chunk)=>{
            data=data+chunk;
        })
        req.on("end",()=>{
        const sendData=JSON.parse(data)
        //console.log("new data ",newData)
        const allData=JSON.parse(fs.readFileSync(filePath,"utf-8"))
        //console.log(allData)
        const id=url.searchParams.get('id')
       // console.log(title)
        const index=allData.findIndex(item=>item.id===id)
        //console.log(index)
        allData[index].title=sendData.title
        
        fs.writeFileSync(filePath,JSON.stringify(allData),'utf-8')

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(allData));

    })
    }
    //Delete Todo
    else if(pathname==="/todos/delete-todo" && req.method==="DELETE"){

        const id=url.searchParams.get("id")
        const allData=JSON.parse(fs.readFileSync(filePath,'utf-8'))
        const latestData=allData.filter(item=>item.id!==id)
        fs.writeFileSync(filePath,JSON.stringify(latestData),'utf-8')
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(latestData))
    }

    else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Not Found Route");
    }
});

server.listen(3000, () => {
    console.log('Successfully run on PORT 3000');
});
//endd
