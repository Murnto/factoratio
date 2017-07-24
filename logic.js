/**
 * Created by synopia on 23/06/14.
 */
webix.editors.myselect = webix.extend({
  focus: function() {},
  getValue: function() {
    return this.getInputNode().getSelectedId().id || this.getInputNode().getSelectedId() || "";
  },
  setValue: function(value) {
    var suggest = this.config.collection || this.config.options(logic.editingId);
    var list = this.getInputNode();
    if (suggest) this.getPopup().getList().data.importData(suggest);
    this.getPopup().show(this.node);
    if (value) {
      webix.assert(list.exists(value), "Option with ID " + value + " doesn't exist");
      if (list.exists(value)) {
        list.select(value);
        list.showItem(value);
      }
    } else {
      list.unselect();
      list.showItem(list.getFirstId());
    }
  },
  getInputNode: function() {
    return this.getPopup().getList();
  },
  popupInit: function(popup) {
    popup.attachEvent("onValueSuggest", function(data) {
      webix.delay(function() {
        webix.callEvent("onEditEnd", [data.id]);
      });
    });
    popup.linkInput(document.body);
  },
  popupType: "richselect"
}, webix.editors.popup);
var logic = {
  targetSpeed: 0,
  editingId: null,
  ratioTree: null,
  recipeTree: null,
  recipes: {},
  init: function() {
    logic.recipeTree = new Tree("recipe_tree");
    logic.ratioTree = new Tree("ratio_tree");
  },
  selectInserters: function(id) {
    var selectedInserters = [];
    $.each(inserters, function(index, inserter) {
      selectedInserters.push({
        id: inserter.id,
        value: inserter.name + " (" + helpers.formatNumber(inserter.speed * 60, 60) + " u/m)"
      });
    });
    return selectedInserters;
  },
  selectFactories: function(id) {
    var item = model.treeLines[id.row].item;
    var factories = helpers.findFactories(item);
    var selectableFactories = [];
    var itemSpeed = 1;
    if (recipes[item]) {
      itemSpeed = recipes[item].speed;
    }
    $.each(factories, function(index, factory) {
      var factorySpeed;
      if (resources[item] !== undefined && factory.speed == 'calculate') {
        console.log(factory, resources[item]);
        // factorySpeed = (resources[item].miningTime / (factory.miningPower - resources[item].hardness) * factory.miningSpeed) * itemSpeed;
        factorySpeed = (factory.miningPower - resources[item].hardness) * factory.miningSpeed / resources[item].miningTime;
      } else {
        factorySpeed = factory.speed * itemSpeed;
      }
      selectableFactories.push({
        id: factory.id,
        value: factory.name + " (" + helpers.formatNumber(factorySpeed, 60) + " u/m)"
      });
    });
    return selectableFactories;
  },
  addRecipe: function(recipe) {
    logic.recipes[recipe] = {item: recipe, speed: logic.targetSpeed};
    logic.updateRecipes();
  },
  removeRecipe: function(recipe) {
    if (logic.recipes[recipe]) {
      delete logic.recipes[recipe];
      logic.updateRecipes();
    }
  },
  reset: function() {
    logic.recipes = {};
    logic.updateRecipes();
  },
  updateLockSpeed: function(isLocked) {
    logic.lockSpeed = isLocked;
  },
  updateRecipes: function() {
    model.init();
    var recipeTree = $.map(logic.recipes, function(recipe) {
      return model.buildProductionTree(null, recipe.item, 1, recipe.speed, {});
    });
    var ratioTree = model.buildRatioTree();
    $$("recipe_tree").clearAll();
    $$("recipe_tree").parse(recipeTree);
    $$("ratio_tree").clearAll();
    $$("ratio_tree").parse(ratioTree);
    logic.updateTargetSpeed();
  },
  updateTargetSpeed: function(targetSpeed) {
    if (targetSpeed) {
      logic.targetSpeed = targetSpeed / 60;
      var timeExponent = $$("selected_unit").getValue()-1;
      logic.targetSpeed = targetSpeed / Math.pow(60, timeExponent);
    }
    logic.recipeTree.updateTargetSpeed();
    logic.ratioTree.updateTargetSpeed();
  }
};
