// Globals
let canvas = {
  e: null, // Canvas element

  w: null, // Canvas width
  h: null, // Canvas height
  v: null, // Canvas vector
};

let env = {
  debug: false, // lol

  bug: {
    id: 0,
    amount: 1000,

    speed: 0.5,

    shape: {
      radius: 3,
    },

    flash: {
      cooldown: 5000,
      duration: 500,
      radius: 100,
    },
  },
};

let colors = {};
let bugs = [];
let timerTracking = [];

// Classes
class Vector2 {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }

  static Zero () { return new Vector2(0, 0); }

  static random () {
    return new Vector2( Math.random(), Math.random() );
  }

  mult (other) {
    if (other instanceof Vector2) {
      this.x *= other.x;
      this.y *= other.y;

      return this;
    } else if (typeof other === `number`) {
      this.x *= other;
      this.y *= other;

      return this;
    }
    
    console.error(`Vector2.mult bad type: ${typeof other}`);
  }

  div (other) {
    if (typeof other === `number`) {
      this.x /= other;
      this.y /= other;

      return this;
    }

    console.error(`Vector2.div didn't expect type: ${typeof other}`);
  }

  add (other) {
    if (typeof other === `number`) {
      this.x += other;
      this.y += other;

      return this;
    } else if (other instanceof Vector2) {
      this.x += other.x;
      this.y += other.y;

      return this;
    }

    console.error(`Vector2.add didn't expect type: ${typeof other}`);
  }

  sub (other) {
    if (typeof other === `number`) {
      this.x -= other;
      this.y -= other;

      return this;
    } else if (other instanceof Vector2) {
      this.x -= other.x;
      this.y -= other.y;

      return this;
    }

    console.error(`Vector2.sub bad type: ${typeof other}`);
  }

  dist (other) {
    if (other instanceof Vector2) {
      const a = this.x - other.x;
      const b = this.y - other.y;

      return Math.sqrt( a * a + b * b );
    }

    console.error(`Vector2.dist bad type: ${typeof other}`);
  }

  copy () {
    // Return a copy of this Vector2.

    return new Vector2(this.x, this.y);
  }

  mag () {
    // Returns the magnitude of the Vector2.

    return Math.sqrt( this.x * this.x + this.y * this.y );
  }

  normalize () {
    // Normalizes the Vector2.

    const mag = this.mag();

    this.div(mag);

    return this;
  }
}

class Bug {

  constructor () {
    this.id = env.bug.id ++;

    this.pos = new Vector2(
      Math.random() * ( canvas.w - env.bug.shape.radius * 2 ) + env.bug.shape.radius,
      Math.random() * ( canvas.h - env.bug.shape.radius * 2 ) + env.bug.shape.radius
    );

    this.speed = env.bug.speed * randomRange(0.85, 1.15); // This bugs personal speed.

    this.flashing = false;
    this.timer = Math.random() * env.bug.flash.cooldown;

    this.goal = null;
  }

  move () {
    const MIN_GOAL_DIST = env.bug.shape.radius * 3;
    
    if (this.goal === null || this.pos.dist(this.goal) <= MIN_GOAL_DIST) {
      this.goal = this.pos.copy();
      
      while (this.pos.dist(this.goal) <= MIN_GOAL_DIST) {
        this.goal = new Vector2(
          randomRange(env.bug.shape.radius * -5, canvas.w + env.bug.shape.radius * 4),
          randomRange(env.bug.shape.radius * -5, canvas.h + env.bug.shape.radius * 4),
        );
      }
    }
    
    let move = this.goal.copy() // Copy goal
      .sub(this.pos).normalize().mult(this.speed) // Move towards goal at own speed.
      .add( Vector2.random().sub(0.5).div(2) ); // Add some jitter.

    this.pos.add(move);
  }

  getFlashed () {
    this.timer -= 50;
    // this.timer /= 2;
  }

  getNeighbors () {
    // Gets all bugs within env.bug.flash.radius.

    return bugs
      .filter(other => other.id !== this.id && this.pos.dist(other.pos) <= env.bug.flash.radius);
  }

  flashNeighbors () {
    // Calls "getFlashed" on all Bugs within env.bug.flash.radius.

    this
      .getNeighbors()
      .filter(other => !other.flashing)
      .forEach(other => other.getFlashed());
  }

  handleFlashing () {
    this.timer -= deltaTime;

    if (this.timer <= 0) {
      this.flashing = !this.flashing;

      if (this.flashing) {
        this.timer = env.bug.flash.duration;

        this.flashNeighbors();
      } else {
        this.timer = env.bug.flash.cooldown;
      }
    }
  }

  step () {
    this.move();
    this.handleFlashing();
  }

  draw () {
    // Draw Bug
    noStroke(); fill(this.flashing ? colors.yellow : colors.gray);
    circle(this.pos.x, this.pos.y, env.bug.shape.radius * 2);

    // Debug (lol)
    if (env.debug && this.id === 0) {
      // Draw radius
      noFill(); stroke(colors.white);
      circle(this.pos.x, this.pos.y, env.bug.flash.radius * 2);

      // Draw goal
      if (this.goal !== null) {
        stroke(colors.red);
        line(
          this.pos.x, this.pos.y,
          this.goal.x, this.goal.y
        );
      }
    }
  }

}

// p5 Functions
function setup () {
  // Canvas
  canvas.e = createCanvas();
  canvas.e.parent(`container`);
  windowResized();

  // Variables
  colors = {
    black: color(0),
    gray: color(128),
    white: color(255),

    green: color(0, 255, 0),
    blue: color(0, 0, 255),
    red: color(255, 0, 0),

    yellow: color(255, 255, 0),
  }

  generateBugs();
}

function draw () {
  // Clearing
  background(colors.black);

  // Drawing
  bugs.forEach(bug => {
    bug.step();
    bug.draw();
  });
}

function windowResized () {
  const size = { w: window.innerWidth, h: window.innerHeight };

  canvas.w = size.w;
  canvas.h = size.h;
  canvas.v = new Vector2(canvas.w, canvas.h);

  resizeCanvas(size.w, size.h);
}

// Functions
function generateBugs () {
  for (let i = 0; i < env.bug.amount; i ++) {
    bugs.push( new Bug() );
  }
}

function randomRange (min, max) {
  return Math.random() * (max - min) + min;
}

function getFlashDeviation () {
  let allTimers = bugs
    .map(bug => bug.timer);

  const mean = allTimers
    .reduce((acc, n) => acc + n, 0) / allTimers.length;
  
  const variance = allTimers
    .map(t => Math.abs(t - mean))
    .reduce((acc, n) => acc + n, 0) / allTimers.length;
  
  const deviation = Math.sqrt(variance);

  return deviation;
}