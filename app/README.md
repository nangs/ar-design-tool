@page VUMIX
##Ar Design Tool

	A tool for you to build augmented reality apps

##Running Server

	To run the server:
	> nodemon start 
	or
	> nodemon ardesign

	if server crashes:
	> npm install
	> nodemon start or nodemon ardesign

##Folder Structure

	|-----	bower_components	(Dependencies installed by bower)
	|-----	node_modules		(Dependencies installed by npm) 
	|-----	public		 		(Static files to be served to frontend) 
	|-----	server				(Modules and configs used by server)
	|-----	test							
	|-----	ardesign.js			(app file)
	|-----	bower.json
	|-----	documentjs.json
	|-----	gulpfile.js
	|-----	package.json		
	L-----	README.MD 			

##How to Document using DocumentJS

	DocumentJS will read blockquotes and recognise them as document objects:
	/**
	 * This is a blockquote
	 */

	Currently, DocumentJS recognises document object VUMIX as the root. This is configured in the documentjs config file documentjs.json. 
	Key things you need for a document object:
	1. type 
	2. parent

	Type can be any of the following: @module/ @page/ @function
	It depends on what you are documenting - whether it is a module, individual function or a readme page. 
	Detailed api can be found here: http://documentjs.com/docs/documentjs.tags.html

	To enter the parent value do @parent
	Example: 
	  @ module(without space) passportgoogle  
	  @ parent(without space) Server_Modules
	  This module configures passportjs 
	 
	  @ param(without space) passport 
	  Requires passportjs