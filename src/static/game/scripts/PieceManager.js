//Piece manager handles all the pieces on the play area. Addition, removal etc.
function PieceManager(){
	this._initial_length=0;
	this._piece_list=[];
	this._total_pieces=0;
	this._num_steps=0;
	this.nPosX=160;
	this.nPosY=78;
	this.currentColumn=0;
	this.currentRow=0;
	this.conclusion_piece_number=null;
	this.new_piece_borders = [];
	//This array keeps track of the x position of the largest piece in each column
	this.col_x_positions = new Array();
	this.col_x_positions.push(160);

	this.addedSolvedPieces = [];

	//Current length of a column
	this.column_length = 10;
	};


	PieceManager.prototype.tweenMatchingPieces = function(selectedPiece){
	    console.log("tweenMatchingPieces function`");
		//Sets alpha of matching pieces to 1, everything else is 0.3
	    
	    allPieces = this.getAllPieces();
	    for(k in selectedPiece.matching){
	        if (selectedPiece.matching[k]){
	            allPieces[k].alpha = 1.0;
	        }
	        else{
	            allPieces[k].alpha = 0.0;
	        }
	        
	    }

		};

	PieceManager.prototype.addedSolvedPiece = function(piece){
		//This function triggers when a solved piece on the board is clicked
						new_piece = this.addPiece(piece.keys);
        				piece.parent1.matching[piece.parent2.pieceNum] = false;
                        piece.parent2.matching[piece.parent1.pieceNum] = false;
                        this._num_steps++;
                        
                        
                        p1_json = {};
                        p1_json.pn = piece.parent1.piece_num;
                        p1_json.pk = piece.parent1.keys;

                        p2_json = {};
                        p2_json.pn = piece.parent2.piece_num;
                        p2_json.pk = piece.parent2.keys;

                        parents = {};
                        parents ["p1"] = p1_json;
                        parents ["p2"] = p2_json;

                        step = {};
                        step ["pn"] = new_piece.piece_num;
                        step ["pk"] = new_piece.keys;

                        step["t"] = this.coreGame.trackTime;
                        step ["parents"] = parents;
                        step["ip"] = sessionStorage.ipaddress;

                        this.coreGame.gameState.savedSteps.push(step);

                        //Sending step data to server

                        this.coreGame.sendStep(step);

                        //res.push(this.parent1.piece_num+","+this.parent2.piece_num+","+new_piece.piece_num);
                        piece.parent2.visible = true;
                        piece.parent2.alpha = 0.3;
                        piece.visible = false;


                        //Adding a green border around a newly placed piece
                        np_border = new createjs.Shape();
                        //np_border.graphics.setStrokeStyle(5).beginStroke("green").drawRect(new_piece.x+new_piece.orgX, new_piece.y+new_piece.orgY, new_piece.width-2, new_piece.height-2)
                        np_border.graphics.setStrokeStyle(5).beginStroke("green").drawRect(50,0, new_piece.width-2, new_piece.height-2)
                        this.new_piece_borders.push(np_border);
                        new_piece.addChild(np_border);
                        new_piece.updateCache();
                        


                        //Adjusting the widths of removed piece
                        piece.parent2.width = piece.parent2.getBounds().width;


                        //Recalculate all solved pieces again. This is to remove repeated results from the board
                        this.coreGame.resetBoard();
                        //pm.adjustPieces();
                        this.tweenMatchingPieces(piece.parent1);
                        this.replaceWithSolvedPieces(piece.parent1);

                        this.coreGame.playArea.addChild(new_piece);
                        //Check if new piece satisfies conclusion
                        if (new_piece.keys.length == 0){
                            this.verifyWin();
                
                            }

	};

	PieceManager.prototype.replaceWithSolvedPieces = function(selectedPiece){
		//this.addedSolvedPieces = [];
		this.temp_piece_list = [];
		
		console.log(this._total_pieces)
		for(i=0;i < this._total_pieces;i++){
			if (i != selectedPiece.pieceNum)
				this._piece_list[i].visible = false;
		}

		for(k in selectedPiece.matching){
	        if (selectedPiece.matching[k]){
	            //var new_keys = solveValues(selectedPiece,allPieces[k]);
	            var new_keys = selectedPiece.matchingSolutions[k];
	            console.log("New keys = " + new_keys);
	           // if (this.checkPiece(new_keys) == false){
	                    //this._piece_list[k].visible = false;
	                    cp = new game.ClausePiece(new_keys, this._piece_list[k].pieceNum, selectedPiece, this._piece_list[k]);
	                    //Experimental code may want to add it to a separate function
	                    this._piece_list[k].width = cp.width;
	                    //End experiment
	                    //cp.x = allPieces[k].homeX;
	                    cp.x = this._piece_list[k].homeX;
	                    cp.y = this._piece_list[k].homeY;
	                    
	                    this.playArea.addChild(cp);
	                    this.addedSolvedPieces.push(cp);
	            //}
	            //else
	            //    this._piece_list[k].alpha = 0.0;

	        	}
        
    	}
	};


	PieceManager.prototype.solveValues = function(p1,p2){
    console.log("solveValues function");
//This function ONLY solves the two pieces and returns an array for the new piece. 
//Should be used to solve not display
 		var num_negations = 0;
        var p1_keys = p1.keys.slice();
        var p2_keys = p2.keys.slice();
		
		var p1_keys_length = p1_keys.length;
		var p2_keys_length = p2_keys.length;
        for(var i = 0; i < p1_keys_length; i++){
			for(var j = 0; j < p2_keys_length; j++){
                if(p1_keys[i] == -1*p2_keys[j]){
                    delete p1_keys[i];
                    delete p2_keys[j];
                    num_negations++;
                    
                }
                else if(p1_keys[i] == p2_keys[j]){
                    delete p1_keys[i];
                    
                }
            
            }
        }
        
        var new_keys = [];
        if(num_negations == 1){
            new_keys = p1_keys.concat(p2_keys).filter(Number);
            new_keys.sort();
        }
        
        return new_keys;

	};

	PieceManager.prototype.addPiece = function(st_list){
		console.log("PieceManager.prototype.addPiece function");
    
		cp = new game.ClausePiece(st_list, this._total_pieces);
		cp.x = cp.homeX = this.nPosX;
		cp.y = cp.homeY = this.nPosY;

		
		//console.log("In add Piece : " + this.nPosX + " " + this.nPosY)
		//cp.piece_num = this._total_pieces;
        this.getMatchingPiecesPositions(cp);
		
		/*
		var piece_num_text = new createjs.Text(cp.piece_num, "30px Arial","red");
		piece_num_text.x = 20;
		cp.addChild(piece_num_text);
		*/

		this._piece_list.push(cp);
		this._total_pieces++;
		
		cp.scaleX = 0.2;
		cp.scaleY = 0.2;
		cp.cache(cp.getBounds().x-2,cp.getBounds().y-2,cp.width+4,cp.height+4);
		//play_area.addChild(cp);

		
		
		
		//Animate the new piece
			createjs.Tween.get(cp).to({scaleX: 0.2, scaleY: 0.2}).to({scaleX: 1, scaleY: 1}, 250);
			createjs.Sound.play("bubble");
			
			
		
			
		this.nextPiecePosition();
		//this.adjustPieces();
		return cp;
		
	};


	PieceManager.prototype.verifyWin = function(){

				console.log("PieceManager.prototype.verifyWin function");
    
				el = document.getElementById("overlay");
				el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";

				//Stop timer
				clearInterval(this.CoreGame.timerId);

				//Add time and steps to win window
				document.getElementById("steps_text").innerHTML = "Total Pieces : " + pm._total_pieces;
				document.getElementById("time_text").innerHTML = "Time : " + track_time + " seconds";
				createjs.Sound.play("cheer");

				/*
				//Send win data 
				var csrf_token = $.cookie('csrftoken');
			    console.log("Sending Solution!")
			        $.ajaxSetup({
			            beforeSend: function(xhr, settings) {
			                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
			                    xhr.setRequestHeader("X-CSRFToken", csrf_token);
			                }
			            }
			        });

			    $.ajax({
			  type: 'POST',
			  url: '/save_solution/',
			  data: "problem_name=" + sessionStorage.getItem("filename")+"&username="+ sessionStorage.getItem("username")+"&total_pieces=" + pm._total_pieces+ "&total_time=" + track_time + "&solution=" + JSON.stringify(game_state.saved_steps),
			  success: function(data){
			        response = data;
			    },
			  dataType: "json",
			  async:false
			});*/

	};
	
	PieceManager.prototype.showPiece = function(st_list, piece_num){
		console.log("PieceManager.prototype.showPiece function")
		cp = ClausePieceShape(st_list, piece_num);
		//cp.regX = (cp.keys.length*100)/2;
		//cp.regY = 50;
		cp.x = this.nPosX;
		cp.y = this.nPosY;
		//console.log(this.nPosX + " " + this.nPosY)
		return cp;
	};
	
	PieceManager.prototype.getAllPieceValues = function(){
		console.log("PieceManager.prototype.getAllPieceValues function");
		var result = []
		var this_piece_list_length = this._piece_list.length;
		for(var i =0;i<this_piece_list_length;i++){
			result.push(this._piece_list[i].keys);
		}
		return result;
	};
	
	//Add the piece to the specified container
	PieceManager.prototype.displayPiece = function(container,piece_num){
		console.log("PieceManager.prototype.displayPiece function");
		container.addChild(this._piece_list[piece_num]);
	};
	
	PieceManager.prototype.displayAllPieces = function(container){
		console.log("PieceManager.prototype.displayAllPieces  function");
		var this_piece_list_length = this._piece_list.length;
		for(var i =0;i<this_piece_list_length;i++){
			console.log("Displaying peice = " + i);
			container.addChild(this._piece_list[i]);
		}
		return container;
	};
	
	PieceManager.prototype.setConclusion =  function(st_list){
		console.log("PieceManager.prototype.setConclusion ");
		this._conclusion = st_list;
		cp = new game.ClausePiece(st_list);
		createjs.Tween.get(cp,{loop:true}).to({scaleX: 0.7, scaleY: 0.7},500).to({scaleX: 1.1, scaleY: 1.1},500).to({scaleX: 1, scaleY: 1},500);
		cp.pieceNum = this._total_pieces;
		this.conclusion_piece_number = this._total_pieces;
		var piece_num_text = new createjs.Text(cp.pieceNum, "30px Arial","red");
		cp.x = cp.homeX = this.nPosX;
		cp.y = cp.homeY = this.nPosY;
		this.nextPiecePosition();
		this.getMatchingPiecesPositions(cp);
        
        
		piece_num_text.x = 20+50;
		cp.addChild(piece_num_text);
		this._piece_list.push(cp);
		this._total_pieces++;
		cp.cache(cp.getBounds().x,cp.getBounds().y,cp.width,cp.height);
		return cp;
	};
	
	PieceManager.prototype.nextPiecePosition =  function(){
		console.log("PieceManager.prototype.nextPiecePosition function");
		if (this.currentRow == this.column_length-1){
			this.nPosX = 320*(this.currentColumn +1) + 160;
			this.nPosY = 78;
			this.currentRow = 0;
			this.currentColumn++;
			this.col_x_positions.push(0);
			//console.log("Col_x_pos = " + this.col_x_positions);
		}
		else{
			this.currentRow++;
			//this.nPosY = 120*(this.currentRow + 1) + 50;
			this.nPosY += 78 + 50;
		}
	};
	
	PieceManager.prototype.getMatchingPieces =  function(selectedPiece){
		console.log("PieceManager.prototype.getMatchingPieces  function");
		result = [];
		var this_piece_list_length = this._piece_list.length;
		for(var i =0;i<this_piece_list_length;i++){
			if(this.negationPresent(selectedPiece,this._piece_list[i])){
				result.push(this._piece_list[i]);
			}
			
		}
		return result;
	};
    
    PieceManager.prototype.getMatchingPiecesPositions =  function(selectedPiece){
        console.log("PieceManager.prototype.getMatchingPiecesPositions function");
		var this_piece_list_length = this._piece_list.length;
		for(var i =0;i<this_piece_list_length;i++){
			if(this.negationPresent(selectedPiece,this._piece_list[i]) && selectedPiece.pieceNum != i){
				console.log(selectedPiece.pieceNum,i);
				selectedPiece.matching[i] = true;
                this._piece_list[i].matching[selectedPiece.pieceNum] = true;
                var solution = this.solveValues(selectedPiece,this._piece_list[i]);
                console.log(selectedPiece.keys==this._piece_list[i].keys);
                selectedPiece.matchingSolutions[i] = this.solveValues(selectedPiece,this._piece_list[i]);
                
                
                this._piece_list[i].matchingSolutions[selectedPiece.pieceNum] = this.solveValues(selectedPiece,this._piece_list[i]);
                
				console.log(this._piece_list[i].matchingSolutions);
			}
            else{
                selectedPiece.matching[i] = false;
                this._piece_list[i].matching[selectedPiece.pieceNum] = false;
				//selectedPiece.matchingSolutions[i] = [];
                
                //this._piece_list[i].matchingSolutions[selectedPiece.pieceNum] = [];                
            }
			
		}
		//selectedPiece.matching[selectedPiece.piece_num] = true;
        
    };
    
	
	PieceManager.prototype.getAllPieces =  function(){
		//console.log("PieceManager.prototype.getAllPieces function");
		result = [];
		var this_piece_list_length = this._piece_list.length;
		for(var i =0;i<this_piece_list_length;i++){
			result.push(this._piece_list[i]);
		}
		return result;
	};
	
	PieceManager.prototype.getPiece = function(piece_num){
		console.log("PieceManager.prototype.getPiece function");
		return this._piece_list[piece_num];
	};
	
	PieceManager.prototype.negationPresent = function(p1,p2){
		console.log("PieceManager.prototype.negationPresent function");
		//Checks if only one negation is present in piece 1 and piece 2
		var result = false;
		var num_negations = 0;
		var p1_keys_length = p1.keys.length;
		var p2_keys_length = p2.keys.length;
		
		for(var i = 0; i < p1_keys_length; i++){
			for(var j = 0; j < p2_keys_length; j++){
				//console.log(p1.keys[i] + " " + -1*p2.keys[j]);
				if (p1.keys[i] == -1*p2.keys[j]){
					//console.log("Found negation!")
					num_negations++;
					
					//break;
				}

			}
		}			
		
		if (num_negations==1){
			result = true;
		}
		
		return result;
	};

/*
	PieceManager.prototype.popPiece = function(){
			//cp = pm._piece_list.splice(piece_num,1)[0];
			console.log("PieceManager.prototype.popPiece function");

		if(pm._total_pieces > pm._initial_length){
			cp = pm._piece_list.pop();
			pm._total_pieces--;
			play_area.removeChild(cp);
			
			var res1 = res[res.length-1].split(',');
			console.log(res1);
			
			pm._piece_list[parseInt(res1[0])].matching[parseInt(res1[1])] = true;
			pm._piece_list[parseInt(res1[1])].matching[parseInt(res1[0])] = true;

			//solution = solveValues(selectedPiece,_piece_list[i]);


			var this_piece_list_length = this._piece_list.length;
			for(var i =0;i<this_piece_list_length;i++){
					delete this._piece_list[i].matching[cp.piece_num];
			}

			if (this.currentRow == 0){
				this.currentRow = 9;
				this.currentColumn--;
				this.nPosX = 320*(this.currentColumn +1) - 160;
				this.nPosY = 120*(this.currentRow + 1) + 50;
				
			}
			else{
				this.currentRow--;
				this.nPosY = 120*(this.currentRow + 1) + 50;
				
			}
				res.pop();
				game_state.saved_steps.pop();
				this.adjustPieces();

			}

	};
*/	

	PieceManager.prototype.checkPiece = function(st_list){
		//console.log("PieceManager.prototype.checkPiece function");
		//This function checks if the piece passed to this function exists in the _piece_list. Accepts an array of integers representing the piece
		var result = false;
		for (var i =0; i< this._piece_list.length; i++){
                if(arraysEqual(st_list,this._piece_list[i].keys)){
                	result = true;
                	break;
                }
        }
		return result;
	};


	PieceManager.prototype.adjustPieces = function(){
		
	///removing duplicates | Jayesh Edit
	//console.log("adjusting ");
	//console.log(pm._piece_list.length);
	arr = [""];
	for (var i = 0; i < pm._piece_list.length; i++) {
		arr.push(pm._piece_list[i].keys);
		if(arr[0]==""){arr.splice(0,1);}

	}

	pm.Jboardlist = JSON.stringify(arr);

		console.log("PieceManager.prototype.adjustPieces function");
		//Experimental function to adjust the spacing between pieces row wise ONLY. Columns are aligned by looking at the col_x_positions array.

		//Minimum space between each piece
		var min_space = 100;
		
		var biggest_spacing = 0;
		for(var currCol = 1; currCol <= this.currentColumn; currCol++){
			biggest_spacing = 0;
			for(var currRow =0; currRow < this.column_length; currRow++){
				if (currCol == this.currentColumn && currRow == this.currentRow)
						break;
				else{	
						//var spacing = pm._piece_list[(currCol-1)*10+currRow].x + (pm._piece_list[(currCol-1)*10+currRow].width/2) + min_space + (pm._piece_list[currCol*10+currRow].width/2);
						var spacing = this.col_x_positions[currCol-1] + (pm._piece_list[(currCol-1)*this.column_length+currRow].width/2) + min_space + (pm._piece_list[currCol*this.column_length+currRow].width/2);
					 	if (spacing > biggest_spacing){
					 		biggest_spacing = spacing;
					 		//console.log("Biggest spacing = " + biggest_spacing);
					 		//this.col_x_positions[currCol] = spacing;
					 	}
					}
				}
				this.col_x_positions[currCol] = biggest_spacing;
			}

			
			//console.log(this.col_x_positions);
			for(var i =this.column_length; i< this._total_pieces; i++)
				{
					//console.log("Col x pos " + this.col_x_positions[Math.floor(i/10)]);
					//pm._piece_list[i].x = pm._piece_list[i].homeX = this.col_x_positions[Math.floor(i/10)];
					this._piece_list[i].homeX = this.col_x_positions[Math.floor(i/this.column_length)];
					createjs.Tween.get(this._piece_list[i]).to({x: this._piece_list[i].homeX, y: this._piece_list[i].homeY}, 500, createjs.Ease.elasticOut);

				}

			for(var i=0; i< this.addedSolvedPieces.length; i++){
				if(this.addedSolvedPieces[i].pieceNum>this.column_length-1){
				this.addedSolvedPieces[i].homeX = this.col_x_positions[Math.floor(this.addedSolvedPieces[i].pieceNum/this.column_length)];
				createjs.Tween.get(this.addedSolvedPieces[i]).to({x: this.addedSolvedPieces[i].homeX, y: this.addedSolvedPieces[i].homeY}, 500, createjs.Ease.elasticOut);
			}

			}
		};


	PieceManager.prototype.rearrangePieces = function(){
		console.log("PieceManager.prototype.rearrangePieces function");
		//Experimental function to redraw all the rows and columns after zooming. This is to dynamically adjust the number of pieces per column (number of rows)
		this.nPosX=160;
		this.nPosY=78;
		this.currentColumn=0;
	this.currentRow=0;

		for(var i = 0; i<this._total_pieces;i++){
			this._piece_list[i].x = this._piece_list[i].homeX = this.nPosX;
			this._piece_list[i].y = this._piece_list[i].homeY = this.nPosY;
			this.nextPiecePosition();

		};

	


	};