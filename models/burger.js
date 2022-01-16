const orm = require('../config/orm');

class Burger {
  constructor({burger_name, devoured = false}) {
    if (burger_name.length <= 75) {
      this.burger_name = burger_name;
    } else {
      throw new Error('Burger name is too long. (Max character length: 75)');
    }
    this.devoured = devoured;
  }

  async save() {
    if (this.id) {
      return await this.updateBurger()
    } else {
      return await this.insertBurger();
    }
  }

  async insertBurger() {
    return await orm.insertOne('burgers', this);
  }

  async updateBurger() {
    this.devoured = fixBool(this.devoured);
    return await orm.updateOne('burgers', this, {id: this.id});
  }

  async deleteBurger() {
    return await orm.deleteOne('burgers', {id: this.id});
  }

  static async selectAll() {
    return await orm.selectAll('burgers');
  }

  static async findBurger(id) {
    const rows = await orm.findById('burgers', id);

    let burger = null;
    if (rows) {
      burger = new Burger(rows[0]);
      burger.id = id;
    }

    return burger;
  }
}

function fixBool(newBool) {
  switch(newBool) {
    case 'true':
    case '1':
    case 1:
      return true;
    default:
      return false;
  }
}

module.exports = Burger;