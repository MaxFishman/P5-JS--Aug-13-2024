let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30); // Adjust the frame rate for smoother animation
  for (let i = 0; i < 200; i++) {
    shapes.push(new Shape(random(width / 6, width * 5 / 6), random(height / 6, height * 5 / 6), 30));
  }
}

function draw() {
  background(255);
  let squareSize = min(width, height) * 0.8;
  let xOffset = (width - squareSize) / 2;
  let yOffset = (height - squareSize) / 2;

  // Draw a square
  stroke(0);
  fill(255);
  rect(xOffset, yOffset, squareSize, squareSize);

  // Update and display shapes inside the square
  for (let shape of shapes) {
    shape.update();
    shape.display();
    shape.checkEdges(xOffset, yOffset, squareSize);
    shape.checkMouseInteraction();
  }

  // Check for collisions and morph shapes
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      shapes[i].checkCollision(shapes[j]);
    }
  }

  // Draw lines connecting each shape to its nearest neighbors
  for (let i = 0; i < shapes.length; i++) {
    shapes[i].connectToNeighbors(shapes);
  }
}

class Shape {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.shapeType = this.getRandomShapeType();
    this.color = this.getRandomColor();
    this.vx = random(-2, 2);
    this.vy = random(-2, 2);
    this.targetShapeType = this.shapeType;
    this.targetColor = this.color;
    this.morphProgress = 0;
  }

  getRandomShapeType() {
    const shapeTypes = ['triangle', 'rectangle', 'ellipse', 'line'];
    return random(shapeTypes);
  }

  getRandomColor() {
    return color(random(255), random(255), random(255), 150);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Morph shapes smoothly
    if (this.morphProgress < 1) {
      this.morphProgress += 0.05;
      this.shapeType = lerpShape(this.shapeType, this.targetShapeType, this.morphProgress);
      this.color = lerpColor(this.color, this.targetColor, this.morphProgress);
    }
  }

  display() {
    fill(this.color);
    noStroke();

    switch (this.shapeType) {
      case 'triangle':
        let x2 = this.x + this.size * 0.5;
        let y2 = this.y - this.size * 0.5;
        let x3 = this.x - this.size * 0.5;
        let y3 = this.y - this.size * 0.5;
        triangle(this.x, this.y, x2, y2, x3, y3);
        break;
      case 'rectangle':
        rect(this.x - this.size * 0.5, this.y - this.size * 0.5, this.size, this.size);
        break;
      case 'ellipse':
        ellipse(this.x, this.y, this.size, this.size);
        break;
      case 'line':
        let x1 = this.x + this.size * 0.5;
        let y1 = this.y + this.size * 0.5;
        line(this.x, this.y, x1, y1);
        break;
    }
  }

  checkEdges(xOffset, yOffset, squareSize) {
    if (this.x < xOffset || this.x > xOffset + squareSize) {
      this.vx *= -1;
    }
    if (this.y < yOffset || this.y > yOffset + squareSize) {
      this.vy *= -1;
    }
  }

  checkCollision(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    if (d < this.size / 2 + other.size / 2) {
      this.targetShapeType = other.shapeType;
      this.targetColor = other.color;
      this.morphProgress = 0;
    }
  }

  connectToNeighbors(shapes) {
    let maxDistance = 100;
    for (let other of shapes) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        if (d < maxDistance) {
          stroke(this.color);
          line(this.x, this.y, other.x, other.y);
        }
      }
    }
  }

  checkMouseInteraction() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size * 2) { // Interaction range
      let angle = atan2(this.y - mouseY, this.x - mouseX);
      let force = map(d, 0, this.size * 2, 5, 0);
      this.vx += cos(angle) * force;
      this.vy += sin(angle) * force;
    }
  }

  explode() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.size * 2) { // Explosion range
      let angle = random(TWO_PI);
      let force = random(5, 10);
      this.vx = cos(angle) * force;
      this.vy = sin(angle) * force;
    }
  }
}

function lerpShape(start, end, amt) {
  if (amt >= 1) return end;
  return amt < 0.5 ? start : end;
}

function mousePressed() {
  for (let shape of shapes) {
    shape.explode();
  }
}

function keyPressed() {
  if (key === ' ') {
    saveCanvas('shapes_morph', 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}