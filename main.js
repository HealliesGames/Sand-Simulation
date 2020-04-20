/**					 															 **/
/**					<!--    >     HealliesGames      <     -->					 **/
/**					<!--    >   -----------------    <     -->					 **/
/**					<!--    >    Sand Simulation     <     -->					 **/
/**					<!--    >   -----------------    <     -->					 **/
/**					<!--    >  Powered by Phaser 3   <     -->                   			 **/
/**															 **/
/** 			 This is a simplified example of how well-known particle physics games work. 			 **/
/**   			  The physics is pretty rough, however it can be taken as a starting point.  			 **/












//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/******************************************************************/
/*                    |----------------------|                    */
/*                    |  Global accessories  |                 	  */
/*                    |----------------------|                    */
/******************************************************************/

const MAX_PARTICLES = 20000,	 	 // The max amount of particles on-screen.
	  PARTICLES_PER_CLICK = 10;	 // The spawn amount of particles at click.

var particles = [], 			 // Vector used to store and manage all the sand particles created.
	texture,			 // The texture canvas for dynamical graphics changes.
	textureData,			 // The raw texture informations.
	UI;			    	 // A Phaser text instance for UI.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////












//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/******************************************************************/
/*                     |-------------------|                      */
/*                     |Simulation creation|                 	  */
/*                     |-------------------|                      */
/******************************************************************/

function simulationCreate( )
{
	// Prevent the default right click menu pop-up.
	this.input.mouse.disableContextMenu();
	
	// Create an empty texture
	texture = this.textures.createCanvas('surface', simulation.config.width, simulation.config.height);
	
	// Create a texture data based on our fresh created texture.
	textureData = texture.getData(0, 0, simulation.config.width, simulation.config.height);
	
	// Add the texture to the Phaser scene.
	this.add.image(0, 0, 'surface').setOrigin(0);
	
	// Add the text instance to the Phaser scene.
	UI = this.add.text(2, 2, '', { fill: '#FFFFFF' }).setDepth(1);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////












//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/******************************************************************/
/*                     |-------------------|                      */
/*                     |Simulation running |                 	  */
/*                     |-------------------|                      */
/******************************************************************/

function simulationUpdate()
{
	// Get mouse cursor informations.
    let pointer = this.input.activePointer;
	
	// Get the mouse coordinates.
	let mouseX = Math.round(pointer.x / RESOLUTION);
	let mouseY = Math.round(pointer.y / RESOLUTION);
	
	// When a mouse button is down
	if(pointer.isDown) {
		
		// If left mouse, create PARTICLES_PER_CLICK particles.
		if(!pointer.rightButtonDown()) { 					
			for(i = 0; i < PARTICLES_PER_CLICK; i++) {		
				if(particles.length < MAX_PARTICLES) {	
					let p = new Sand(mouseX, mouseY);	  // Create a new particle.
					particles.push(p);			  // Add the particle to the particles vector.
				}
			}
		} 
		
		// If right mouse, destroy particles by a 10x10 square pixels around the mouse.
		if(pointer.rightButtonDown()){
			for(i = 0; i < particles.length; i++) {
				let isInsideActionRange = particles[i].x >= mouseX - 5 & particles[i].x <= mouseX + 5 & particles[i].y >= mouseY - 5 & particles[i].y <= mouseY + 5;
				
				if(isInsideActionRange) {
					particles[i].pReset();	// Delete the trace of the particle from the texture data (therefore from the texture).
					particles.splice(i, 1);	// Remove the particle.
				}
			}
		}
	}
	
	// Show the amount of particles on-screen.
	UI.setText(particles.length);	
	
	// Clean all the particles from the texture.
	particles.forEach(function(p){
		p.pReset();
	},this);	
	
	// Compute each particle.
	particles.forEach(function(p){
		p.pAct();
	},this);
	
	// Update all the computed particles to the texture.
	texture.putData(textureData, 0, 0);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/******************************************************************/
/*                     |-------------------|                      */
/*                     |   Particle Class  |                 	  */
/*                     |-------------------|                      */
/******************************************************************/

class Particle {

	// The constructor
		constructor(x, y) {
			// Particle coordinates.
			this.x = x;
			this.y = y;
		}
			

	// The computing part 
		pAct() {
			// Custom child particle behaviour.
		}

	// Check if there's a particle at a given position.
	// This is done by checking the texture data alpha channel.
		pCheck(xPos, yPos) {
			let thereIsParticle;
			return thereIsParticle = textureData.data[((yPos * (textureData.width * 4)) + (xPos * 4)) + 3] == 0 ? false : true;
		}
		

	// Reset the texture data channels at texture/particle coordinates.
		pReset() {
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4))] = 0;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 1] = 0;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 2] = 0;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 3] = 0;
		}


	// Set the texture data channels at texture/particle coordinates.
		pSet(r, g, b) {
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4))] = r;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 1] = g;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 2] = b;
			textureData.data[((this.y * (textureData.width * 4)) + (this.x * 4)) + 3] = 255;
		}
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/******************************************************************/
/*                     |-------------------|                      */
/*                     |    Sand Class     |                 	  */
/*                     |-------------------|                      */
/******************************************************************/

class Sand extends Particle{
	
	constructor(x, y) {
		// Call the "Particle" constructor and all its methods.
		super(x, y);
		
		// Particle falling speed.
		this.gravity = 0;
		
		// Particle max vertical speed.
		this.MAX_GRAVITY = 15;
		
		// Particle RGB colour.
		this.colour = [194, 178, 128];
		
		// Particle random colour gradation.
		this.cGradation = Math.floor(Math.random() * 30);
	}

	pAct() {
		
		// Check if the particle can fall left by detecting if there's another particle on its bottom-left.
		if(!this.pCheck(this.x - 1, this.y + 2) && this.x > 0)
			this.x --;
		
		// Check if the particle can fall right by detecting if there's another particle on its bottom-right.
		if(!this.pCheck(this.x + 1, this.y + 2) && this.x < simulation.config.width - 1)
			this.x ++;
		
		// Increase self gravity speed.
		if(this.gravity < this.MAX_GRAVITY)
			this.gravity ++;	
		
		// While falling:
		for(i = this.y; i <= this.y + this.gravity; i++) {		
			if(this.pCheck(this.x, i)) { 				// If encounter another particle:
				if(i == this.y) {						// If are in the same position:
					var rndX = Math.round(Math.random());			
					this.x = rndX == 1 ? this.x + 1 : this.x - 1;		// Randomly shift self X position.
					this.y = i - 1;				// Set the position on top of the other particle.
				} 
				
				this.gravity = 0;				// Reset fall speed.
				break;	
			}
		}
		
		this.y += this.gravity;						// Increase Y position by falling speed.
	
		//Mantain the position inside the game screen.
		this.x = Phaser.Math.Clamp(this.x, 0, simulation.config.width - 1);
		this.y = Phaser.Math.Clamp(this.y, 0, simulation.config.height - 1);
			
		
		// After determing the position, mark the presence in the texture data with defined colour and gradiation.
		this.pSet(
					this.colour[0] - this.cGradation, 
					this.colour[1] - this.cGradation, 
					this.colour[2] - this.cGradation, 
					);
	}
	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
