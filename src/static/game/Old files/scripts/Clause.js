(function() {


var p = createjs.extend(ClausePiece, createjs.Container);


var ClausePiece = function(st_list) {
	this.Container_contructor();
	
	this.keys = st_list;
	this.createPieces();
}

//ClausePiece.prototype = Object.create(createjs.Container.prototype);



p.createPieces = function(){
	var colors = ['blue', 'red', 'green', 'yellow','blue','pink', 'black'];
    var i;
    
    this.currentAngle = 0;
    for (i=0; i < this.keys.length;i++){
        var st = new createjs.Shape();

        st.graphics.setStrokeStyle(10);
        if (this.keys[i] > 0){
            //st.graphics.beginStroke('white');
            st.graphics.beginFill(colors[this.keys[i]]);
        }
        else if(this.keys[i] < 0){
            st.graphics.beginStroke(colors[-1*this.keys[i]]);
            //st.graphics.beginFill('white');
        }
        hit = new createjs.Shape();
        hit.graphics.beginFill("#000").rect(PIECE_W*i, 0, PIECE_W, PIECE_H);
        st.hitArea = hit;

        //st.graphics.drawRect((PIECE_W)*i, 0, PIECE_W-2*BORDER_THICKNESS, PIECE_H-2*BORDER_THICKNESS);
        st.graphics.drawRoundRect((PIECE_W)*i, 0, PIECE_W-2*BORDER_THICKNESS, PIECE_H-2*BORDER_THICKNESS,20);
        st.key = this.keys[i];
        this.addChild(st);
    }

    this.regX = (this.keys.length * 100 )/2;
    this.regY = 50;
    this.y = Math.random()*600;
    this.x = Math.random()*800;

    this.on("mousedown", function(evt){
                            
                            stage.setChildIndex(evt.currentTarget,stage.getNumChildren() - 1);
                            //evt.currentTarget.regX = stage.mouseX;
                            //evt.currentTarget.regY = stage.mouseY;
                                });

    this.on("pressmove", function(evt){
                            evt.currentTarget.x = evt.stageX;
                            evt.currentTarget.y = evt.stageY;
                            
                            main_stage.update();
                        });
    this.on("dblclick",function(evt){
                            evt.currentTarget.currentAngle += 90;
                            //evt.currentTarget.rotation += 90;
                            createjs.Tween.get(evt.currentTarget).to({rotation:evt.currentTarget.currentAngle},500);
                            createjs.Sound.play("woosh",createjs.Sound.INTERRUPT_NONE,0,0,1,.5,0);
                            main_stage.update();

    });
    //this.on("pressup", checkCollision);

	
};

window.ClausePiece = createjs.promote(ClausePiece,"Container");


}());
