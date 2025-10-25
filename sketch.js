let gameState = "start";
let width = 800;
let height = 600;

let welcome;
let pixelfont;
let currentLocation = 0;
let rangers = 0;
let animalSprites = [];
let currentRanger;

let arrowButtons = {
  left: {x: 50, y: height / 2 - 25, w: 50, h: 50},
  right: {x: width - 100, y: height / 2 - 25, w: 50, h: 50}
};

let username = "";
let usernameInputActive = false;

let animals = [];
let rangerMessages = [];

let mailTimer = 0;
let nextSpawnTime = 0;

let mailMessage = null;
let clickedAnimal = null;

let mailArrived = false;
let newMail = false;

function preload() {
  welcome = loadImage('assets/locations/welcome.png');
  pixelfont = loadFont('assets/font/pixelfont.ttf');
  locations = [
    loadImage('assets/locations/beach.png'),
    loadImage('assets/locations/street.png'),
    loadImage('assets/locations/trailWater.png'),
    loadImage('assets/locations/tree.png'),
    loadImage('assets/locations/water.png')
  ];
  rangers = [
    loadImage('assets/rangers/ranger1.png'),
    loadImage('assets/rangers/ranger2.png'),    
    loadImage('assets/rangers/ranger3.png'),
    loadImage('assets/rangers/ranger4.png'),
    loadImage('assets/rangers/ranger5.png'),
    loadImage('assets/rangers/ranger6.png')];
  animalSprites = [
    loadImage('assets/animals/bird.png'), // 0 
    loadImage('assets/animals/cardinal.png'), // 1
    loadImage('assets/animals/cat.png'), // 2
    loadImage('assets/animals/dog.png'), // 3
    loadImage('assets/animals/duck.png'), // 4
    loadImage('assets/animals/fish.png'), // 5
    loadImage('assets/animals/goose.png'), // 6
    loadImage('assets/animals/rabbit.png'), // 7
    loadImage('assets/animals/rat.png'), // 8
    loadImage('assets/animals/squirrel.png'), // 9
    loadImage('assets/animals/chicken.png'), // 10
    loadImage('assets/animals/guinea pig.png'), // 11
    loadImage('assets/animals/heron.png'), // 12
    loadImage('assets/animals/racoon.png'), // 13
    loadImage('assets/animals/turtle.png'), // 14
    loadImage('assets/animals/bug.png'), // 15
    loadImage('assets/animals/deer.png'), // 16
    loadImage('assets/animals/hawk.png'), // 17
    loadImage('assets/animals/skunk.png'), // 18
    
    loadImage('assets/animals/bat.png'), // 19
    loadImage('assets/animals/fox.png'), // 20
    loadImage('assets/animals/frog.png'), // 21
    loadImage('assets/animals/horseshoe crab.png'), // 22
    loadImage('assets/animals/iguana.png'), // 23
    loadImage('assets/animals/snake.png'), // 24
    loadImage('assets/animals/whale.png'), // 25
    loadImage('assets/animals/wolf.png') // 26
  ];
}

class Animal {
  constructor(data) {
    this.species = data.species;
    this.animalClass = data.animalClass;
    this.status = data.status;
    this.condition = data.condition;
    this.action = data.action;
    this.imageIndex = data.imageIndex;
    
    let xmargin = 50;
    let ymargin = 150;
    this.x = random(xmargin, width - xmargin);
    this.y = random(height * 0.85, height - ymargin);

    this.size = random(50,80);
  }

  display(x = null, y = null, size = null) {
    let drawX = x ?? this.x;
    let drawY = y ?? this.y;
    let drawSize = size ?? this.size;
    
    imageMode(CENTER);
    image(animalSprites[this.imageIndex], drawX, drawY, drawSize, drawSize);
    imageMode(CORNER);
    
    textAlign(CENTER);
    textSize(12);
  }
}

let buttonLayouts = {
  start: {x: width / 2 - 80, y: height / 2 + 140, w: 160, h: 60},
  infoCard: {
    exit: {x: width / 2 + 190, y: height / 2 - 135, w: 25, h: 25},
    ranger: {x: width / 2 - 63, y: height / 2 + 85, w: 135, h: 40},
  },
  mail: {x: width / 2 + 190, y: height / 2 - 135, w: 25, h: 25},
  mailIcon: {x: 30, y: height - 80, w: 50, h: 50}
};

function setup() {
  createCanvas(width, height);
}

function draw() {
  if (gameState == "start") drawStartScreen();
  else if (gameState == "usernameInput") drawUsernameInputScreen();
  else if (gameState == "play") playGame();
  else if (gameState == "infoCard") drawInfoCard();
  else if (gameState == "mail") drawMailLetter();

  if (mailArrived) drawMailAlertIcon();
   

  if (mailTimer > 0 && millis() > mailTimer) {
    mailArrived = true;
    newMail = true;
    mailTimer = 0;
  }
}

function mousePressed() {
  const clicks = {
    start: handleStartClick,
    usernameInput: handleUsernameInputClick,
    play: handlePlayClick,
    infoCard: handleInfoCardClick,
    mail: handleMailClick,
  };

  if (clicks[gameState]) {
    clicks[gameState]();
  }
}

function handleStartClick() {
  const b = buttonLayouts.start;
  
  if (isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "usernameInput";
    usernameInputActive = true;
  }
}

function handleUsernameInputClick() {
  if (isMouseInside(width / 2 - 80, height / 2 + 100, 160, 60) && username.trim() !== "") {
    usernameInputActive = false;
    currentRanger = random(rangers);
    gameState = "play";
  }
}

function keyPressed() {
  if (gameState === "usernameInput" && usernameInputActive) {
    if (keyCode === BACKSPACE) username = username.slice(0, -1);
    else if (keyCode === ENTER && username.trim() !== "") {
      usernameInputActive = false;
      currentRanger = random(rangers);
      gameState = "play";
    }
  }
}

function keyTyped() {
  if (gameState === "usernameInput" && usernameInputActive) {
    if (key.length === 1) username += key;
  }
}


function handlePlayClick() {
  
  const left = arrowButtons.left;
  const right = arrowButtons.right;
  
  if (isMouseInside(left.x, left.y, left.w, left.h)) {
    currentLocation = (currentLocation - 1 + locations.length) % locations.length;
    respawnAnimals()
    return;
  }
  if (isMouseInside(right.x, right.y, right.w, right.h)) {
    currentLocation = (currentLocation + 1) % locations.length;
    respawnAnimals()
    return;
  } 
  
  for (let a of animals) {
    if (dist(mouseX, mouseY, a.x, a.y) < a.size / 2) {
      clickedAnimal = a;
      gameState = "infoCard";
      
      return;
    }
  }
  
  const b = buttonLayouts.mailIcon;

  if (mailArrived && isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "mail";
    newMail = false;
    mailArrived = false;
  }
}

function handleInfoCardClick() {
  const exitB = buttonLayouts.infoCard.exit;
  const rangerB = buttonLayouts.infoCard.ranger;
  
  if (isMouseInside(exitB.x, exitB.y, exitB.w, exitB.h)) {
    clickedAnimal = null;
    gameState = "play";
  } 
  else if (isMouseInside(rangerB.x, rangerB.y, rangerB.w, rangerB.h)){
    handleMailLetter(clickedAnimal);
    clickedAnimal = null;
    gameState = "play";
  }
}

function handleMailClick() {
  const b = buttonLayouts.mail;
  
  if (isMouseInside(b.x, b.y, b.w, b.h)) {
    gameState = "play";
    mailMessage = null;
  }
}

function isMouseInside(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function playGame() {
  drawGameBackground();
  
  if (millis() > nextSpawnTime && animals.length < 3) {
    spawnAnimal();
    nextSpawnTime = millis() + random(8000, 12000);
  }

  for (let a of animals) {
    stroke(0);
    strokeWeight(2);
    a.display();
    
    if (dist(mouseX, mouseY, a.x, a.y) < a.size / 2) {
      showAnimalInfo(a);
    }
  }
}

function handleMailLetter(a) {
  animals = animals.filter(animal => animal !== a);
  
  let id = "311SR#: " + "311-" + floor(random(10000, 100000)) + "-" + floor(random(100, 1000));
  
  let action = null;
  let status = null;
  let condition = a.condition.toLowerCase();
  
  if (a.action == "Relocated") action = "has been safely\nrelocated.";
  else if (a.action == "Taken to ACC") action = "has been safely\ntaken to the Animal Care Center.";
  else if (a.action == "Not Found") action = "was unable to be found.";
  else if (a.action == "Advised or Educated Others") action = "has been left undisturbed.\nThis provided a great opportunity to\neducate others on how to treat our\nfriends and their habitats with respect.";
  else if (a.action == "Monitored") action = "is currently being\nmonitored by fellow park rangers.";
  else if (a.action == "Rehabilitated") action = "is being rehabilitated by\nanimal caretakers.";
  else if (a.action == "Submitted for DEC Testing") action = "has been submitted for\nDEC testing.";
  
    if (a.status == "Native") status = `is native to New York, which you can\nspot year round! It is our duty to protect them and not disturb their\nnatural habitat as best we can. Good work ${username}!`
  else if (a.status == "Exotic") status = `is exotic and has found its way to New\nYork. While they might be fascinating to look at, it’s important to \nreport it, especially if you suspect it is being kept illegally without\nproper licensing. Good work ${username}!`
  else if (a.status == "Invasive") status = `is invasive and often competes with native\nspecies here in New York for resources. We must be mindful of\ntheir impact on local ecosystems and do our part to protect native \nwildlife. Good work ${username}!`;
  else if (a.status == "Domestic") status = `is domestic and often a pet! If you see\none wandering, it may be lost. Report them so they may be safely\nreunited with their family or taken to a local animal shelter.\nGood work ${username}!`;

  
  let text1 = `Hey ${username},\n\nJust wanted to let you know that the\n${a.species} you reported is\n${condition} and ${action}`;
  
  let text2 = `This ${a.species} ${status}`

  mailMessage = {
    id: id,
    text1: text1,
    text2: text2,
    animalData: a
  }
  
  rangerMessages.push(mailMessage);

  mailTimer = millis() + 10000;
}

function spawnAnimal() {
  let total = 1965;
  
  let r = random(total);
  let cumulative = 0;

  for (let a of animalData) {
    cumulative += a.count;
    
    if (r <= cumulative) {
      animals.push(new Animal(a));
      break;
    }
  }
}

function showAnimalInfo(a) {  
  let barWidth = 80;
  let barHeight = 10;

  let health = 0;
  let rarity = 0;
  
  if (a.condition == "Healthy") health = 1;
  else if (a.condition == "Injured" || a.condition == "Unhealthy") health = 0.5;
  else if (a.condition == "Dead on Arrival") health = 0;
  
  if (a.status === "Exotic") rarity = 1;
  else if (a.status === "Invasive") rarity = 0.75;
  else if (a.status === "Native") rarity = 0.5;
  else if (a.status === "Domestic") rarity = 0.25;

  stroke(0);
  strokeWeight(2);
  
  fill(200); 
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 35, barWidth, barHeight, 5);
  
  textFont("Arial");
  fill("red");
  textSize(18);
  
  text("❤︎‬‬", a.x - barWidth / 2 - 20, a.y - a.size / 2 - 30);
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 35, barWidth * health, barHeight, 5);

  fill(200); 
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 15, barWidth, barHeight, 5);

  fill("gold");
  text("★", a.x - barWidth / 2 - 20, a.y - a.size / 2 - 10);
  rect(a.x - barWidth / 2, a.y - a.size / 2 - 15, barWidth * rarity, barHeight, 5);
  textFont(pixelfont);
}

function respawnAnimals() {
  animals = [];
  let initialSpawnCount = random(0, 3);
  
  for (let i = 0; i < initialSpawnCount; i++) {
    spawnAnimal();
  }

  nextSpawnTime = millis() + random(8000, 12000);
}

function drawStartScreen() {
  
  image(welcome, 0, 0 , width, height);

  fill(255, 255, 255, 150);
  rectMode(CENTER);
  rect(width / 2, height / 2 - 60, 310, 150);
  rect(width / 2, 400, 240, 50);
  
  
  rectMode(CORNER);
  
  textFont(pixelfont);
  textAlign(CENTER, CENTER);
  textSize(60);
  fill(0);
  text(`The Wild \nWild Life`, width / 2, height / 2 - 65);
  
  textAlign(CENTER, CENTER);
  textSize(25);
  fill(0);
  text(`Protect NYC's Wildlife!`, width / 2, height / 2 + 100);
  
  textSize(40);
  const b = buttonLayouts.start;
  drawButton(b.x, b.y, b.w, b.h, "Start");

  let textPulse = 30 + sin(millis() * 0.003) * 2
  
  
  //NYC banner
  translate(width - 350, 330);
  rotate(radians(-25));
  fill("yellow");
  rect(0, 0, 160, 50);
  fill(0);
  textSize(textPulse);
  textAlign(CENTER, CENTER);
  text(`NYC Edition`, 81, 21);
}

function drawUsernameInputScreen() {
  background(255);
  textFont(pixelfont);
  fill(0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("Enter Your Name", width / 2, height / 2 - 50);

  fill(255);
  stroke(0);
  rect(width / 2 - 150, height / 2, 300, 50, 10);

  noStroke();
  fill(0);
  textSize(30);
  text(username || "Click To Type..", width / 2, height / 2 + 23); 

  drawButton(width / 2 - 80, height / 2 + 100, 160, 60, "Continue");
}

function drawGameBackground() {
  stroke(0);
  strokeWeight(2);
  
  if (locations.length > 0) image(locations[currentLocation], 0, 0, width, height);
  else background("white");
  
  drawArrowButtons();
}

function drawArrowButtons() {
  const left = arrowButtons.left;
  const right = arrowButtons.right;
  textSize(30);
  
  //left arrow
  fill(isMouseInside(left.x, left.y, left.w, left.h) ? "lightgrey" : "white");
  rect(left.x, left.y, left.w, left.h, 10);
  fill(0);
  textAlign(CENTER, CENTER);
  text("<", left.x + left.w / 2, left.y + left.h / 2 - 2);
  
  //right arrow
  fill(isMouseInside(right.x, right.y, right.w, right.h) ? "lightgrey" : "white")
  rect(right.x, right.y, right.w, right.h, 10);
  fill(0);
  text(">", right.x + right.w / 2, right.y + right.h / 2 - 2);
}


function drawInfoCard() {
  stroke(0);
  strokeWeight(2);
  fill("white")
  rect(width / 2 - 225, height / 2 - 150, 450, 310, 15);
  
  fill(202, 217, 237)
  rect(width / 2 - 200, height / 2 - 125, 150, 150, 15);

  clickedAnimal.display(width / 2 - 125, height / 2 - 50, 120);
  
  noStroke();
  fill(0);
  textFont(pixelfont);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Species: ${clickedAnimal.species}\n\nAnimal Class: ${clickedAnimal.animalClass}\n\nCondition: ${clickedAnimal.condition}`, width / 2 - 30, height / 2 - 100);
  
  const exitB = buttonLayouts.infoCard.exit;
  const rangerB = buttonLayouts.infoCard.ranger;
  
  noStroke();
  fill(isMouseInside(exitB.x, exitB.y, exitB.w, exitB.h) ? "red" : "black");
  textAlign(CENTER, CENTER);
  textSize(30);
  textFont("Arial");
  text("✘", exitB.x + exitB.w / 2, exitB.y + exitB.h / 2);
  
  noStroke();
  textSize(35);
  fill(0);
  text("🕻", rangerB.x - 20, rangerB.y + 23);
  textFont(pixelfont);
  
  textSize(23);
  drawButton(rangerB.x, rangerB.y, rangerB.w, rangerB.h, "Call Ranger?");
}

function drawMailLetter() {

  stroke(0);
  strokeWeight(2);
  fill("white")
  rect(width / 2 - 225, height / 2 - 150, 450, 315, 15);
  
  fill(202, 217, 237)
  rect(width / 2 - 200, height / 2 - 125, 150, 150, 15);

  let a = mailMessage.animalData;
  new Animal(a).display(width / 2 - 125, height / 2 - 50, 120);

  noStroke();
  fill(0);
  textSize(16)
  textAlign(LEFT, TOP);
  text(mailMessage.text1, width / 2 - 30, height / 2 - 115);

  text(mailMessage.text2, width / 2 - 200, height / 2 + 50);
  text(mailMessage.id, width / 2 - 200, height / 2 + 135);    

  const b = buttonLayouts.mail;

  noStroke();
  fill(isMouseInside(b.x, b.y, b.w, b.h) ? "red" : "black");
  textAlign(CENTER, CENTER);
  textSize(30);
  textFont("Arial");
  text("✘", b.x + b.w / 2, b.y + b.h / 2);
  textFont(pixelfont);
}


function drawRanger() {
  const b = buttonLayouts.mailIcon;
  
  stroke(0);
  fill(202, 217, 237);
  ellipse(b.x + b.w / 2, b.y + b.h / 2, 70, 70);
  
  imageMode(CENTER);
  image(currentRanger, b.x + b.w / 2, b.y + b.h / 2 - 3, 180, 180);
  imageMode(CORNER);
}


function drawMailAlertIcon() {
  stroke(0);
  strokeWeight(2);

  const b = buttonLayouts.mailIcon;
  const d = dist(mouseX, mouseY, b.x, b.y);
  
  drawRanger();

  noStroke();
  fill("red");
  textSize(45);
  textAlign(CENTER, CENTER);
  textFont("Arial");
  text("!", b.x + 50, b.y + 10);
  textFont(pixelfont);

}

function drawButton(x, y, w, h, label) {
  stroke(0);
  strokeWeight(2);
  fill(isMouseInside(x, y, w, h) ? color(202, 217, 237) : color(73, 110, 189));
  rect(x, y, w, h, 10);
  fill(0);
  
  noStroke();
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

let animalData = [
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 2 },
  { species: "Chicken", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Eastern Coyote", status: "Native", condition: "Dead on Arrival", animalClass: "Large Mammal", action: "Relocated", imageIndex: 26, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Peregrine Falcon", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Peregrine Falcon", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Merlin", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Dolphin", status: "Native", condition: "Injured", animalClass: "Marine Mammal", action: "Not Found", imageIndex: 25, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raptor", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 11, count: 0 },
  { species: "Striped Skunk", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "White-Footed Mouse", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 8, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Tufted Titmouse", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 8, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Eurasian Eagle-Owl", status: "Exotic", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Eurasian Eagle-Owl", status: "Exotic", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Rehabilitated", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 12, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Brant Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Not Found", imageIndex: 2, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Minke Whale", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Mammal", action: "Monitored", imageIndex: 25, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Alligator", status: "Exotic", condition: "Unhealthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Rehabilitated", imageIndex: 23, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Snow Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 1 },
  { species: "Snow Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "American Coot", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 2 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 2 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Hooded Merganser", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Softshell Turtle", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Greater Scaup", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 4, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Painted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 2 },
  { species: "Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 10, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 10, count: 4 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Unhealthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 2 },
  { species: "Big Brown Bat", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 19, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 9, count: 3 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Ball Python", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 24, count: 1 },
  { species: "Great Horned Owl", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Eastern Cottontail Rabbit", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 7, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 10, count: 3 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Dark-Eyed Junco", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Norway Rat", status: "Invasive", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 8, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 2 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Iguana", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 23, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Yellow-Bellied Sapsucker", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "House Sparrow", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Great horned owl", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Guinea Fowl", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 2 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 1, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 2 },
  { species: "Canada Goose", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 2 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Softshell Turtle", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Submitted for DEC Testing", imageIndex: 14, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 2, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Yellow-Crowned\nNight Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Yellow-Bellied Sapsucker", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Diamondback Terrapin", status: "Native", condition: "Unhealthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Northern Spiny Softshell Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "American Robin", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 1, count: 1 },
  { species: "Painted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Painted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Black-Crowned\nNight Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Norway Rat", status: "Invasive", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 8, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 12, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "De Kay's Brown Snake", status: "Native", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 24, count: 1 },
  { species: "Painted turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "House Sparrow", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Budgerigar Parakeet", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 2, count: 1 },
  { species: "Painted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Red Bat", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Relocated", imageIndex: 19, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Great horned owl", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 17, count: 2 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 1, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "House Sparrow", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Domestic Dove", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 2 },
  { species: "Great Horned Owl", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 17, count: 2 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Advised or Educated Others", imageIndex: 14, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 2 },
  { species: "Brant Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Great Horned Owl", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Horseshoe Crab", status: "Native", condition: "Healthy", animalClass: "Marine Reptile\nor Arthropod", action: "Relocated", imageIndex: 22, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Red Fox", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 20, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 4 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Red-Bellied woodpecker", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Great Horned Owl", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 4 },
  { species: "Gray Seal", status: "Native", condition: "Healthy", animalClass: "Marine Mammal", action: "Monitored", imageIndex: 25, count: 1 },
  { species: "Indian Peafowl", status: "Exotic", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Eastern Coyote", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Not Found", imageIndex: 26, count: 0 },
  { species: "American Robin", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 1, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Great Horned Owl", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Gray Tree Frog", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 21, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 12, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 4 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 2, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 2 },
  { species: "Atlantic Sturgeon", status: "Native", condition: "Dead on Arrival", animalClass: "Fish", action: "Relocated", imageIndex: 5, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Southern Flying Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Robin", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "Worm-Eating Warbler", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Groundhog", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Unhealthy", animalClass: "Large Mammal", action: "Submitted for DEC Testing", imageIndex: 16, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 4 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Brant Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Northern Mockingbird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Black-Crowned\nNight Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 7 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 4 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Painted Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Wood Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Wood Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "American Robin", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Hamster", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 8 },
  { species: "Painted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Eastern Coyote", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Not Found", imageIndex: 26, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 4 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Advised or Educated Others", imageIndex: 14, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 10, count: 1 },
  { species: "European Starling", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Diamondback Terrapin", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "European Starling", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 2 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Eel", status: "Invasive", condition: "Healthy", animalClass: "Fish", action: "Taken to ACC", imageIndex: 5, count: 40 },
  { species: "American Bullfrog", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 21, count: 30 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 9, count: 1 },
  { species: "House Wren", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 2 },
  { species: "Red fox", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 20, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Monitored", imageIndex: 16, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Crow", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 4 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Barn Swallow", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Painted turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Mourning Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Red-Bellied woodpecker", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Bearded Dragon", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 23, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 4 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Red-eared Slider", status: "Invasive", condition: "Unhealthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Not Found", imageIndex: 14, count: 0 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 4 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 2 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 9, count: 4 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 4 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Not Found", imageIndex: 16, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Rehabilitated", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 2, count: 0 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Advised or Educated Others", imageIndex: 14, count: 1 },
  { species: "Blue Jay", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 18, count: 0 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Relocated", imageIndex: 16, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 4, count: 6 },
  { species: "Mallard Duck", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Yellow-Bellied Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Rock Dove", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 1, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Spotted Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Rehabilitated", imageIndex: 14, count: 1 },
  { species: "Blue Jay", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Red Bat", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 19, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Norway Rat", status: "Invasive", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 8, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Black-Crowned\nNight Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Eastern Cottontail Rabbit", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 7, count: 4 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 9, count: 8 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Falcon", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mourning Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 2, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Relocated", imageIndex: 16, count: 1 },
  { species: "Rock Dove", status: "Invasive", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "European Starling", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Guinea Pig", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 11, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 6 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "American Crow", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 2, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 17, count: 4 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Bullhead Catfish", status: "Native", condition: "Healthy", animalClass: "Fish", action: "Advised or Educated Others", imageIndex: 5, count: 300 },
  { species: "Chicken", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 7 },
  { species: "House Sparrow", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 2 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Pitt Bull Mix", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 7 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 2 },
  { species: "Unknown", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Dead on Arrival", animalClass: "Large Mammal", action: "Taken to ACC", imageIndex: 16, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 10, count: 2 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 3 },
  { species: "Domestic Dove", status: "Domestic", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Eastern Coyote", status: "Native", condition: "Dead on Arrival", animalClass: "Large Mammal", action: "Relocated", imageIndex: 26, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 6 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 4 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Groundhog", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 5 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 17, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 3 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 6 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 2 },
  { species: "House Finch", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Brant Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Not Found", imageIndex: 16, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Coyote", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Monitored", imageIndex: 26, count: 2 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 4 },
  { species: "American Bittern", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Dead on Arrival", animalClass: "Large Mammal", action: "Relocated", imageIndex: 16, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Coyote", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Not Found", imageIndex: 26, count: 0 },
  { species: "Black-Backed Gull", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Northern Gannet", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Mourning Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 10, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 6 },
  { species: "Black Scoter", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 4 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 7, count: 0 },
  { species: "American Oystercatcher", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Red Bat", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 19, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Golden-Crowned Kinglet", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Coyote", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Monitored", imageIndex: 26, count: 1 },
  { species: "Gray Catbird", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 2, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 6 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Eastern Phoebe", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 3 },
  { species: "Swainson's Thrush", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 3 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 9, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Gray catbird", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Silver-Haired bat", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 19, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Hermit Thrush", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Northern Brownsnake", status: "Native", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 24, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Groundhog", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "American Robin", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 1, count: 0 },
  { species: "Green-Winged Teal", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 3 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Healthy", animalClass: "Large Mammal", action: "Monitored", imageIndex: 16, count: 1 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 1, count: 0 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 0 },
  { species: "Virginia Opossum", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 2 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Cockatiel", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Songbird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Cooper's Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Wood Thrush", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "American Woodcock", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 12, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 18, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 3 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Advised or Educated Others", imageIndex: 3, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 18, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Great Black-Backed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Leopard Gecko", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 23, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Great Black-Backed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Warbler", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 10 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Black-and-White Warbler", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Laughing Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Eastern Phoebe", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 2 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Red Fox", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 20, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 2 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Virginia Rail", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Rehabilitated", imageIndex: 7, count: 4 },
  { species: "Ovenbird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 6 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Yellowthroat", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 10 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Hummingbird", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 4 },
  { species: "Sea Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Reptile\nor Arthropod", action: "Not Found", imageIndex: 14, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Mourning dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Flycatcher", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 2, count: 1 },
  { species: "Muscovy Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Muscovy Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Mute Swan", status: "Invasive", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Ruby-Throated Hummingbird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Ball python", status: "Exotic", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Not Found", imageIndex: 24, count: 0 },
  { species: "Sharp-Shinned Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 5 },
  { species: "Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Hornet", status: "Native", condition: "Healthy", animalClass: "Insect", action: "Monitored", imageIndex: 15, count: 100 },
  { species: "White-Tailed Deer", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Taken to ACC", imageIndex: 16, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 12, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 4, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Domestic Duck", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 4, count: 3 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Atlantic Menhaden", status: "Native", condition: "Dead on Arrival", animalClass: "Fish", action: "Advised or Educated Others", imageIndex: 5, count: 100 },
  { species: "Diamondback Terrapin", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Fish", status: "Native", condition: "Dead on Arrival", animalClass: "Fish", action: "Not Found", imageIndex: 5, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 6, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rabbit", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 2 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 3 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 6, count: 2 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Humpback Whale", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Mammal", action: "Monitored", imageIndex: 25, count: 1 },
  { species: "Bat", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 19, count: 1 },
  { species: "Indian Peafowl", status: "Exotic", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 4, count: 1 },
  { species: "Budgerigar Parakeet", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Parakeet", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 2 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 2 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Rock Dove", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 18, count: 0 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 4 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 2 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Submitted for DEC Testing", imageIndex: 12, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 7, count: 1 },
  { species: "American Black Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Black-Backed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 11, count: 4 },
  { species: "Ring-Billed gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 2 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Bird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Osprey", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 11, count: 4 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 2 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Eastern Red Bat", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 19, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Injured", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "American Kestrel", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Gerbil", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 11, count: 1 },
  { species: "Greater Yellowlegs", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Diamondback Terrapin", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 13, count: 9 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 6 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Striped Skunk", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 18, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 11, count: 2 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Swamp Eel", status: "Invasive", condition: "Dead on Arrival", animalClass: "Fish", action: "Relocated", imageIndex: 5, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 12, count: 2 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 2 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Cedar Waxwing", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Winged Blackbird", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 6, count: 1 },
  { species: "Guinea Pig", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 11, count: 2 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Rehabilitated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Canada Goose", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Mourning Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Monitored", imageIndex: 2, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Crow", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Ball Python", status: "Exotic", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 24, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Laughing Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Domestic Dove", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Great Blue Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 12, count: 0 },
  { species: "Cat", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "American Kestrel", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 0, count: 1 },
  { species: "Gull", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 9, count: 0 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Mourning Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Not Found", imageIndex: 3, count: 0 },
  { species: "Ring-Billed Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "American Robin", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 1, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Not Found", imageIndex: 14, count: 0 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Norway Rat", status: "Invasive", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 8, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 9, count: 1 },
  { species: "American Robin", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 1, count: 1 },
  { species: "Loon", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Not Found", imageIndex: 16, count: 0 },
  { species: "Great Blue Heron", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 4, count: 1 },
  { species: "Crow", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 9, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Advised or Educated Others", imageIndex: 0, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 1, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Iguana", status: "Exotic", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 23, count: 1 },
  { species: "Loon", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 4, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 6, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Canada Goose", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 6, count: 1 },
  { species: "Eastern Coyote", status: "Native", condition: "Dead on Arrival", animalClass: "Large Mammal", action: "Relocated", imageIndex: 26, count: 1 },
  { species: "Yellow-Bellied Slider", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Eastern Gray Squirrel", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 9, count: 1 },
  { species: "Laughing Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Northern Gannet", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Loggerhead Sea Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Reptile\nor Arthropod", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Eastern Cottontail Rabbit", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Relocated", imageIndex: 7, count: 4 },
  { species: "Dog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 3, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 0, count: 1 },
  { species: "Sparrow", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Wild Turkey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 17, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 13, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Advised or Educated Others", imageIndex: 13, count: 6 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Taken to ACC", imageIndex: 14, count: 1 },
  { species: "Yellow-Crowned\nNight Heron", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 2 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 4, count: 10 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 2 },
  { species: "American Robin", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "East Asian bullfrog", status: "Exotic", condition: "Dead on Arrival", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 21, count: 9 },
  { species: "Virginia Opossum", status: "Native", condition: "Injured", animalClass: "Small Mammal", action: "Not Found", imageIndex: 13, count: 0 },
  { species: "Chimney Swift", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 3 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Monitored", imageIndex: 12, count: 1 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 1, count: 1 },
  { species: "Loggerhead Sea Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Reptile\nor Arthropod", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Eastern Kingbird", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Peregrine Falcon", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "American Robin", status: "Native", condition: "Injured", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "Leatherback Sea Turtle", status: "Native", condition: "Dead on Arrival", animalClass: "Marine Reptile\nor Arthropod", action: "Relocated", imageIndex: 14, count: 2 },
  { species: "Osprey", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 12, count: 1 },
  { species: "Domestic Rabbit", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 7, count: 1 },
  { species: "House Sparrow", status: "Invasive", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Osprey", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 0, count: 0 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Unhealthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Snapping Turtle", status: "Native", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Monitored", imageIndex: 14, count: 1 },
  { species: "Mallard Duck", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Monitored", imageIndex: 4, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Injured", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Chicken", status: "Domestic", condition: "Healthy", animalClass: "Bird", action: "Taken to ACC", imageIndex: 10, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Unhealthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 17, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Red-Tailed Hawk", status: "Native", condition: "Injured", animalClass: "Bird", action: "Not Found", imageIndex: 17, count: 0 },
  { species: "Double-Crested\nCormorant", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Groundhog", status: "Domestic", condition: "Dead on Arrival", animalClass: "Small Mammal", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Red-Eared Slider", status: "Invasive", condition: "Healthy", animalClass: "Terrestrial\nReptile or Amphibian", action: "Relocated", imageIndex: 14, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Dead on Arrival", animalClass: "Pet", action: "Relocated", imageIndex: 2, count: 1 },
  { species: "Dog", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 3, count: 1 },
  { species: "Cat", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Taken to ACC", imageIndex: 2, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "White-Tailed Deer", status: "Native", condition: "Injured", animalClass: "Large Mammal", action: "Taken to ACC", imageIndex: 16, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Injured", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Healthy", animalClass: "Small Mammal", action: "Monitored", imageIndex: 13, count: 1 },
  { species: "Domestic Rabbit", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Rehabilitated", imageIndex: 7, count: 1 },
  { species: "Domestic Goose", status: "Domestic", condition: "Healthy", animalClass: "Pet", action: "Advised or Educated Others", imageIndex: 6, count: 1 },
  { species: "Raccoon", status: "Native", condition: "Unhealthy", animalClass: "Small Mammal", action: "Taken to ACC", imageIndex: 13, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Herring Gull", status: "Native", condition: "Injured", animalClass: "Bird", action: "Taken to ACC", imageIndex: 12, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Healthy", animalClass: "Bird", action: "Rehabilitated", imageIndex: 0, count: 2 },
  { species: "House Sparrow", status: "Invasive", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 4 },
  { species: "American Robin", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 1, count: 1 },
  { species: "Rock Dove", status: "Native", condition: "Dead on Arrival", animalClass: "Bird", action: "Relocated", imageIndex: 0, count: 1 },
];

