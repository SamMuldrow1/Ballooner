const path = require('path')
var electron = require('electron');
var appe = electron.app;
var BrowserWindow = electron.BrowserWindow;
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1366, height: 1024})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
appe.on('ready', createWindow)

// Quit when all windows are closed.
appe.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    appe.quit()
  }
})

appe.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.












var express = require('express');
var connect = require('connect');
const internalIp = require('internal-ip');
var TinyURL = require('tinyurl');
var conApp = connect();
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var dl = require('delivery');
var fs = require('fs');




app.use('/Files', express.static(path.join(__dirname, '/Files')))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/delivery.js', function(req, res){
  res.sendFile(__dirname + '/delivery.js');
});
app.get('/Receive.html', function(req, res){
  res.sendFile(__dirname + '/Receive.html');
});
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

io.on('connection', function(socket){
	internalIp.v4().then(ip => {
    console.log(ip);
    io.to(socket.id).emit('SendIP', ip, socket.id);
    //=> '10.0.0.79'
	});
	
	var delivery = dl.listen(socket);
	  delivery.on('receive.success',function(file){
	    var params = file.params;
	    fs.writeFile(__dirname + '/Files/' +file.name,file.buffer, function(err){
	      if(err){
	        console.log('File could not be saved.');
	      }else{
	        console.log('File saved.');
	        let TempHTML = '<!DOCTYPE html>\n' +  
             '<html>\n' + 
             '<body>\n' + 
             '<a href="/Files/' + file.name + ' " id ="DownloadLink" download="SharedFile">\n' + 
             '<script src="https://code.jquery.com/jquery-1.11.1.js"></script>\n' +
             '<script type="text/javascript">\n' + 
             '$(document).ready(function() {\n' + 
             'document.getElementById("DownloadLink").click();\n' + 
             '});\n' +  
             '</script>'+
             '</body>\n' + 
             '</html>\n';
             
			fs.writeFile(__dirname + "/Files/"+file.name+".html", TempHTML, function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file was saved!");
			}); 
	      };
	    });
	  });





  socket.on('GetTinyURL', function(URL, ID){
	 TinyURL.shorten(URL, function(res) {
	    
	    io.to(ID).emit('SendURL', res);
	});
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
