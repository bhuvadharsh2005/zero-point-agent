/**
 * THE KNOWLEDGE BASE
 * A central repository of ingredient data to drive smart logic.
 */

const INGREDIENT_DB = {
    // PROTEINS
    "roasted chicken": {
        type: "protein",
        priority: true,
        day1: ["Lemon-Herb Roast Chicken", "Chicken & Roasted Veggie Tray Bake", "Garlic Butter Chicken Thighs"],
        day2: ["Chicken Salad Sandwiches", "Shredded Chicken Tacos", "Chicken Noodle Soup"],
        matches: ["lemon", "garlic", "potatoes", "carrots", "thyme"],
        gap_fillers: ["Fresh Parsley", "Lemon"]
    },
    "ground beef": {
        type: "protein",
        priority: true,
        day1: ["Classic Spaghetti Bolognese", "Beef & Broccoli Stir Fry", "Homemade Burger Patties"],
        day2: ["Beef Shepherd's Pie (using leftovers)", "Stuffed Bell Peppers", "Chili Con Carne"],
        matches: ["onion", "garlic", "tomato paste", "bell peppers"],
        gap_fillers: ["Bell Peppers", "Canned Tomatoes"]
    },
    "salmon": {
        type: "protein",
        priority: true,
        day1: ["Pan-Seared Salmon with Crispy Skin", "Baked Salmon with Dill", "Miso Glazed Salmon"],
        day2: ["Salmon Fish Cakes", "Cold Flaked Salmon Salad", "Salmon Fried Rice"],
        matches: ["lemon", "dill", "asparagus", "rice"],
        gap_fillers: ["Fresh Dill", "Asparagus"]
    },
    "tofu": {
        type: "protein",
        priority: true,
        day1: ["Crispy Sesame Tofu", "Mapo Tofu (Spicy)", "Tofu Vegetable Curry"],
        day2: ["Tofu Scramble Burritos", "Cold Tofu Salad with Soy Dressing", "Miso Soup Add-in"],
        matches: ["soy sauce", "ginger", "green onions", "rice"],
        gap_fillers: ["Green Onions", "Ginger"]
    },

    // VEGETABLES
    "spinach": {
        type: "vegetable",
        priority: true,
        day1: ["Garlic Sautéed Spinach Side", "Creamy Spinach Pasta", "Spinach & Feta Stuffed Chicken"],
        day2: ["Green Smoothie (freeze leftovers)", "Spinach & Cheese Frittata", "Wilted Spinach in Soup"],
        matches: ["garlic", "lemon", "cheese", "eggs"],
        gap_fillers: ["Lemon", "Feta Cheese"]
    },
    "mushrooms": {
        type: "vegetable",
        priority: true,
        day1: ["Creamy Mushroom Risotto", "Garlic Butter Roasted Mushrooms", "Mushroom Stroganoff"],
        day2: ["Mushroom Omelette", "Mushroom Toast", "Leftover Risotto Arancini Balls"],
        matches: ["thyme", "garlic", "butter", "rice"],
        gap_fillers: ["Fresh Thyme", "Parmesan"]
    },
    "broccoli": {
        type: "vegetable",
        priority: true,
        day1: ["Roasted Broccoli with Parmesan", "Beef & Broccoli Stir Fry", "Broccoli Cheddar Soup"],
        day2: ["Broccoli Frittata", "Chopped Broccoli Salad", "Pasta with Broccoli Pesto"],
        matches: ["cheddar", "garlic", "lemon", "almonds"],
        gap_fillers: ["Cheddar Cheese", "Almonds"]
    },
    "avocado": {
        type: "vegetable",
        priority: true,
        day1: ["Fresh Guacamole & Chips", "Avocado Toast with Egg", "Chicken & Avocado Salad"],
        day2: ["Green Goddess Dressing (blend it)", "Chocolate Avocado Mousse", "Add to Morning Smoothie"],
        matches: ["lemon", "lime", "toast", "cilantro"],
        gap_fillers: ["Lime", "Cilantro"]
    },

    // DAIRY / FRIDGE
    "milk": {
        type: "dairy",
        priority: true,
        day1: ["Béchamel Sauce for Pasta", "Creamy Mashed Potatoes", "Homemade Mac & Cheese"],
        day2: ["Overnight Oats", "Pancakes or Crepes", "French Toast"],
        matches: ["flour", "butter", "oats", "cereal"],
        gap_fillers: ["Oats", "Cereal"]
    },
    "heavy cream": {
        type: "dairy",
        priority: true,
        day1: ["Creamy Alfredo Pasta", "Cream of Mushroom Soup", "Potato Gratin"],
        day2: ["Whipped Cream for Dessert", "Rich Scrambled Eggs", "Coffee Creamer"],
        matches: ["pasta", "parmesan", "potatoes"],
        gap_fillers: ["Parmesan Cheese", "Pasta"]
    },
    "eggs": {
        type: "protein",
        priority: true,
        day1: ["Shakshuka", "Vegetable Quiche", "Fried Rice with Egg"],
        day2: ["Egg Salad Sandwiches", "Breakfast Burritos", "Boiled Eggs Snack"],
        matches: ["toast", "spinach", "peppers", "onion"],
        gap_fillers: ["Bread", "Bell Peppers"]
    }
};

const DISH_DB = {
    "pizza": {
        ingredients: ["flour", "tomato sauce", "mozzarella", "oregano", "yeast"],
        base_type: "baking"
    },
    "burger": {
        ingredients: ["ground beef", "burger bun", "lettuce", "tomato", "cheese"],
        base_type: "grill"
    },
    "pasta": {
        ingredients: ["pasta", "tomato sauce", "garlic", "olive oil", "parmesan"],
        base_type: "boil"
    },
    "salad": {
        ingredients: ["spinach", "lettuce", "cucumber", "tomato", "olive oil"],
        base_type: "raw"
    },
    "omelette": {
        ingredients: ["eggs", "milk", "butter", "cheese", "spinach"],
        base_type: "fry"
    },
    "pancakes": {
        ingredients: ["flour", "milk", "eggs", "baking powder", "butter"],
        base_type: "grill"
    }
};

// Helper: Get list of keys for autocomplete
const INGREDIENT_KEYS = Object.keys(INGREDIENT_DB);
