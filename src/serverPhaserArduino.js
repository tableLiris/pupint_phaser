var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    
    five = require('johnny-five'),
        board = new five.Board(),
        buttonTable1Left,
        buttonTable1Top,
        buttonTable1Right,

    cpt = 0

    app.listen(1337);

    function handler (req, res){
        fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
    }
    
    board.on("ready", function(){
		console.log('Board ready');
		buttonTable1Left = new five.Button({
			pin: 13
		});
		buttonTable1Right = new five.Button({
			pin: 2
		});
		buttonTable1Top = new five.Button({
			pin: 11
		});

		io.sockets.on('connection', function(socket){
			console.log("connected");
			socket.emit('news', { hello: cpt });
			cpt++;
			socket.on('my other event', function (data){
				console.log(data);
			});
			
			socket.on('addSprite', function(data){
				socket.broadcast.emit('addSprite',data);
			});
			socket.on('disconnect', function() {
				cpt--;
			});
			
			buttonTable1Left.on("hold", function(){
				console.log("button held : changeWorldLeft");
				socket.emit("changeWorldLeft");
			});

			buttonTable1Right.on("hold", function(){
				console.log("button held : changeWorldRight");
				socket.emit("changeWorldRight");
			});

			buttonTable1Top.on("hold", function(){
				console.log("button held : changeWorldTop");
				socket.emit("changeWorldTop");
			});
		});

  });  

