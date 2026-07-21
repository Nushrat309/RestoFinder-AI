import json
import random
import os
from pathlib import Path

# Seed for reproducible realistic data generation
random.seed(42)

CITIES_DATA = {
    "Dhaka": [
        ("Dhanmondi", 23.7461, 90.3742),
        ("Gulshan", 23.7925, 90.4078),
        ("Banani", 23.7937, 90.4066),
        ("Uttara", 23.8759, 90.3795),
        ("Mirpur", 23.8069, 90.3687),
        ("Mohammadpur", 23.7658, 90.3583),
        ("Bashundhara R/A", 23.8151, 90.4255),
        ("Baridhara", 23.8055, 90.4188),
        ("Niketan", 23.7788, 90.4111),
        ("Mohakhali", 23.7778, 90.4056),
        ("Farmgate", 23.7561, 90.3872),
        ("Tejgaon", 23.7600, 90.3950),
        ("Shahbagh", 23.7388, 90.3958),
        ("Ramna", 23.7375, 90.4012),
        ("Motijheel", 23.7330, 90.4172),
        ("Paltan", 23.7350, 90.4110),
        ("Kakrail", 23.7400, 90.4090),
        ("Badda", 23.7805, 90.4267),
        ("Rampura", 23.7617, 90.4208),
        ("Khilgaon", 23.7531, 90.4283),
        ("Khilkhet", 23.8290, 90.4200),
        ("Aftab Nagar", 23.7690, 90.4310),
        ("Banasree", 23.7620, 90.4330),
        ("Wari", 23.7186, 90.4186),
        ("Lalbagh", 23.7197, 90.3879),
        ("Old Dhaka", 23.7099, 90.4071),
        ("Jigatola", 23.7390, 90.3710),
        ("Kalabagan", 23.7520, 90.3840),
        ("Adabor", 23.7710, 90.3580),
        ("Shyamoli", 23.7730, 90.3680),
        ("Agargaon", 23.7780, 90.3780),
        ("Gabtoli", 23.7830, 90.3480),
        ("Cantonment", 23.8210, 90.3950),
        ("Nikunja", 23.8320, 90.4130),
        ("Kuril", 23.8240, 90.4220),
        ("Abdullahpur", 23.8850, 90.3980)
    ],
    "Chittagong": [
        ("Agrabad", 22.3250, 91.8120),
        ("GEC Circle", 22.3580, 91.8210),
        ("Nasirabad", 22.3640, 91.8260),
        ("Halishahar", 22.3160, 91.7850),
        ("Prabartak", 22.3590, 91.8310),
        ("Khulshi", 22.3680, 91.8080)
    ],
    "Sylhet": [
        ("Zindabazar", 24.8940, 91.8680),
        ("Amberkhana", 24.9030, 91.8670),
        ("Shibganj", 24.8910, 91.8890),
        ("Upashahar", 24.8870, 91.8790)
    ],
    "Rajshahi": [
        ("Saheb Bazar", 24.3630, 88.6040),
        ("Kazla", 24.3680, 88.6280),
        ("Motihar", 24.3670, 88.6360),
        ("Boalia", 24.3710, 88.5990)
    ]
}

CUISINE_PREFIXES = {
    "Biryani & Traditional": ["Kacchi", "Shahi", "Nawab", "Grand", "Bhai", "Traditional", "Royal", "Babu", "Sultans", "Star"],
    "Burgers & Fast Food": ["Burger", "Chillox", "Madchef", "Takeout", "Grill", "Smokey", "Patty", "Buns", "Craft", "Bite"],
    "Chinese & Asian": ["Wok", "Dragon", "Hakka", "Nagasaki", "Panda", "Bamboo", "Dynasty", "Golden", "Lotus", "Sichuan"],
    "Cafe & Bakery": ["Coffee", "Bean", "Espresso", "Bakery", "Artisan", "Brew", "Cup", "Crust", "Pastry", "Roastery"],
    "Steak & BBQ": ["Steakhouse", "Smoke", "Woodsmoke", "Flame", "BBQ", "Sizzle", "Charcoal", "Pitmaster", "Prime", "Butcher"],
    "Pizza & Pasta": ["Pizza", "Pasta", "Bella", "Italiano", "Slice", "Oven", "Dough", "Mama", "Romano", "Milano"],
    "Desserts & Ice Cream": ["Sweet", "Gelato", "Scoop", "Dessert", "Creamery", "Choco", "Frosting", "Sugar", "Velvet", "Delight"],
    "Seafood & Grill": ["Ocean", "Bay", "Catch", "Fisherman", "Coastal", "Wave", "Harbor", "Seafood", "Crab", "Prawn"],
}

POPULARITY_BADGES = ["Top Seller", "Chef Special", "Must Try", "Trending", "Regular"]

FOOD_TEMPLATES = {
    "Biryani & Traditional": [
        ("Mutton Kacchi Biryani", "Biryani", 380, 480, ["Chinigura Rice", "Mutton Leg", "Mustard Oil", "Potato", "Saffron"], ["Non-Veg", "Halal"], "images/sultans_dine_kacchi.png"),
        ("Beef Tehari", "Tehari", 220, 320, ["Aromatic Rice", "Beef Cubes", "Mustard Oil", "Green Chili", "Cloves"], ["Non-Veg", "Halal"], "images/default_food.png"),
        ("Chicken Morog Polao", "Polao", 280, 380, ["Basmati Rice", "Whole Chicken Quarter", "Ghee", "Boiled Egg", "Raisins"], ["Non-Veg", "Halal"], "images/default_food.png"),
        ("Chittagong Beef Kala Bhuna", "Curry", 320, 450, ["Beef Shunk", "Caramelized Onion", "Black Spices", "Mustard Oil"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("Shahi Borhani (500ml)", "Drinks", 80, 120, ["Curd", "Mint", "Cumin", "Black Salt", "Mustard"], ["Veg", "Gluten-Free"], "images/default_food.png"),
        ("Special Shahi Jorda", "Dessert", 90, 140, ["Sweet Rice", "Mawa", "Nuts", "Kismis", "Baby Sweets"], ["Veg"], "images/default_food.png"),
        ("Puran Dhaka Mutton Haleem", "Soup", 200, 300, ["Lentils", "Wheat", "Mutton Chunks", "Fried Onion", "Ginger"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Khichuri with Egg", "Khichuri", 240, 320, ["Aromatic Rice", "Moong Dal", "Beef Curry", "Fried Egg"], ["Non-Veg"], "images/default_food.png"),
        ("Tandoori Naan Bread", "Bread", 40, 70, ["Flour", "Yogurt", "Butter", "Black Cumin"], ["Veg"], "images/default_food.png"),
        ("Butter Chicken Masala", "Curry", 340, 440, ["Chicken Breast", "Tomato Butter Sauce", "Fresh Cream", "Kasuri Methi"], ["Non-Veg"], "images/default_food.png"),
        ("Reshmi Chicken Kabab (4 pcs)", "Kabab", 300, 400, ["Chicken Mince", "Cream", "Cashew Paste", "Mild Spices"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Sheek Kabab", "Kabab", 260, 360, ["Beef Mince", "Raw Papaya", "Garam Masala", "Mustard Oil"], ["Non-Veg"], "images/default_food.png"),
        ("Firni Bowl", "Dessert", 70, 100, ["Ground Rice", "Milk", "Cardamom", "Pistachio"], ["Veg"], "images/default_food.png"),
        ("Special Rooh Afza Lassi", "Drinks", 90, 130, ["Yogurt", "Rose Syrup", "Ice", "Sugar"], ["Veg"], "images/default_food.png"),
        ("Hyderabadi Dum Biryani", "Biryani", 360, 460, ["Basmati Rice", "Marinated Chicken", "Fried Shallots", "Mint"], ["Non-Veg"], "images/default_food.png"),
        ("Rui Fish Curry with Rice", "Main Course", 220, 300, ["Rui Fish", "Mustard Paste", "Green Chili", "Steamed Rice"], ["Non-Veg"], "images/default_food.png"),
        ("Duck Bhuna Curry", "Curry", 350, 480, ["Farm Duck", "Garlic", "Chili Oil", "Whole Spices"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Vuna Khichuri", "Khichuri", 260, 350, ["Rice", "Lentils", "Spiced Beef", "Ghee"], ["Non-Veg"], "images/default_food.png"),
        ("Laccha Paratha", "Bread", 35, 60, ["Whole Wheat", "Ghee", "Layered Dough"], ["Veg"], "images/default_food.png"),
        ("Shahi Tukda", "Dessert", 110, 160, ["Fried Bread", "Rabri Milk", "Saffron", "Almonds"], ["Veg"], "images/default_food.png"),
    ],
    "Burgers & Fast Food": [
        ("Smokey BBQ Beef Burger", "Burger", 280, 380, ["Beef Patty", "BBQ Sauce", "Cheddar Cheese", "Caramelized Onion"], ["Non-Veg"], "images/burger_lab_smoky.png"),
        ("Double Cheese Blast Burger", "Burger", 340, 460, ["Double Beef Patty", "Double Cheddar", "Secret Sauce", "Pickles"], ["Non-Veg"], "images/default_food.png"),
        ("Crispy Spicy Chicken Burger", "Burger", 240, 320, ["Crispy Fried Chicken", "Spicy Mayo", "Lettuce", "Sesame Bun"], ["Non-Veg"], "images/default_food.png"),
        ("Loaded Cheesy Fries", "Sides", 160, 240, ["French Fries", "Melted Cheese", "Jalapeno", "Bacon Bits"], ["Veg"], "images/default_food.png"),
        ("Buffalo Chicken Wings (6 pcs)", "Appetizer", 260, 340, ["Chicken Wings", "Buffalo Hot Sauce", "Ranch Dip"], ["Non-Veg"], "images/default_food.png"),
        ("Classic Beef Smash Burger", "Burger", 250, 340, ["Smashed Beef", "American Cheese", "Onions", "Pickles"], ["Non-Veg"], "images/default_food.png"),
        ("Mushroom Swiss Burger", "Burger", 310, 420, ["Beef Patty", "Sautéed Mushrooms", "Swiss Cheese", "Garlic Aioli"], ["Non-Veg"], "images/default_food.png"),
        ("Chicken Tender Strips (4 pcs)", "Sides", 220, 290, ["Crispy Chicken Strips", "Honey Mustard Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Mozzarella Cheese Sticks", "Sides", 200, 280, ["Fried Mozzarella", "Marinara Sauce"], ["Veg"], "images/default_food.png"),
        ("Onion Rings Bucket", "Sides", 140, 200, ["Crispy Onion Rings", "Garlic Dip"], ["Veg"], "images/default_food.png"),
        ("Monster Beef Tower Burger", "Burger", 450, 580, ["Triple Patty", "Bacon", "Fried Egg", "Extra Cheese"], ["Non-Veg"], "images/default_food.png"),
        ("Veggie Bean Patty Burger", "Burger", 220, 300, ["Black Bean Patty", "Avocado", "Vegan Mayo", "Lettuce"], ["Veg"], "images/default_food.png"),
        ("Chocolate Milkshake", "Drinks", 180, 250, ["Whole Milk", "Belgian Chocolate", "Whipped Cream"], ["Veg"], "images/default_food.png"),
        ("Oreo Freakshake", "Drinks", 220, 300, ["Oreo Crumbles", "Vanilla Ice Cream", "Chocolate Drizzle"], ["Veg"], "images/default_food.png"),
        ("Chicken Nuggets (8 pcs)", "Sides", 190, 260, ["Minced Chicken", "Crispy Batter", "Ketchup"], ["Non-Veg"], "images/default_food.png"),
        ("Grilled Chicken Club Sandwich", "Sandwich", 260, 340, ["Toasted Bread", "Grilled Chicken", "Egg", "Tomato"], ["Non-Veg"], "images/default_food.png"),
        ("Hot Spicy Chicken Wrap", "Wrap", 230, 310, ["Tortilla", "Fried Chicken Tenders", "Spicy Mayo"], ["Non-Veg"], "images/default_food.png"),
        ("Curly Seasoned Fries", "Sides", 170, 230, ["Spiral Potatoes", "Cajun Seasoning"], ["Veg"], "images/default_food.png"),
        ("Chili Cheese Dog", "Fast Food", 210, 280, ["Beef Sausage", "Chili Meat Sauce", "Melted Cheese"], ["Non-Veg"], "images/default_food.png"),
        ("Cold Coffee with Ice Cream", "Drinks", 160, 220, ["Espresso", "Cold Milk", "Vanilla Scoop"], ["Veg"], "images/default_food.png"),
    ],
    "Chinese & Asian": [
        ("Chicken Steamed Dumplings (8 pcs)", "Dumplings", 280, 360, ["Chicken Mince", "Ginger", "Chili Soy Dip"], ["Non-Veg"], "images/momo_banani.png"),
        ("Special Fried Rice", "Rice", 260, 340, ["Basmati Rice", "Prawns", "Chicken", "Egg", "Spring Onion"], ["Non-Veg"], "images/default_food.png"),
        ("Sichuan Chili Chicken", "Main Course", 340, 440, ["Chicken Cubes", "Dry Red Chili", "Sichuan Pepper", "Soy Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Sizzling with Garlic", "Main Course", 420, 540, ["Beef Tenderloin", "Capsicum", "Garlic Butter", "Soy Glaze"], ["Non-Veg"], "images/default_food.png"),
        ("Thai Spicy Tom Yum Soup", "Soup", 290, 380, ["Lemongrass", "Galangal", "Prawns", "Mushrooms", "Lime"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("Crispy Honey Lemon Chicken", "Main Course", 320, 420, ["Fried Chicken", "Honey Glaze", "Lemon Juice", "Sesame"], ["Non-Veg"], "images/default_food.png"),
        ("Chow Mein Noodles", "Noodles", 240, 320, ["Egg Noodles", "Julienned Veggies", "Chicken", "Dark Soy"], ["Non-Veg"], "images/default_food.png"),
        ("Prawn Spring Rolls (4 pcs)", "Appetizer", 260, 330, ["Prawn Filling", "Crispy Wrapper", "Sweet Chili Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Sweet & Sour Prawns", "Main Course", 390, 500, ["King Prawns", "Pineapple", "Capsicum", "Sweet Sour Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Manchow Soup with Crispy Noodles", "Soup", 220, 290, ["Vegetable Broth", "Garlic", "Soy", "Fried Noodles"], ["Veg"], "images/default_food.png"),
        ("Japanese Chicken Ramen Bowl", "Ramen", 480, 620, ["Ramen Noodles", "Rich Chicken Broth", "Ajitsuke Tamago", "Nori"], ["Non-Veg"], "images/default_food.png"),
        ("Salmon Sushi Roll (6 pcs)", "Sushi", 650, 850, ["Fresh Salmon", "Sushi Rice", "Nori", "Wasabi", "Ginger"], ["Non-Veg"], "images/default_food.png"),
        ("Crispy Peking Duck Wrap", "Main Course", 580, 750, ["Roast Duck", "Pancake Wrap", "Hoisin Sauce", "Cucumber"], ["Non-Veg"], "images/default_food.png"),
        ("Mapo Tofu with Minced Beef", "Main Course", 310, 400, ["Silken Tofu", "Beef Mince", "Sichuan Paste", "Chili Oil"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Chili Onion", "Main Course", 350, 460, ["Sliced Beef", "Green Chili", "Onion Wedges", "Oyster Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Mixed Vegetable in Garlic Sauce", "Main Course", 220, 290, ["Broccoli", "Baby Corn", "Carrot", "Garlic Sauce"], ["Veg"], "images/default_food.png"),
        ("Chicken Corn Soup", "Soup", 180, 240, ["Sweet Corn", "Shredded Chicken", "Egg Drop"], ["Non-Veg"], "images/default_food.png"),
        ("Korean Spicy Fried Chicken", "Appetizer", 340, 440, ["Gochujang Sauce", "Double Fried Chicken", "Sesame Seeds"], ["Non-Veg"], "images/default_food.png"),
        ("Pad Thai Rice Noodles", "Noodles", 360, 460, ["Flat Rice Noodles", "Tamarind", "Peanuts", "Tofu", "Shrimp"], ["Non-Veg"], "images/default_food.png"),
        ("Green Thai Chicken Curry", "Main Course", 380, 480, ["Coconut Milk", "Green Curry Paste", "Eggplant", "Chicken"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
    ],
    "Cafe & Bakery": [
        ("Iced Caramel Macchiato", "Coffee", 260, 340, ["Espresso", "Vanilla Syrup", "Steamed Milk", "Caramel Drizzle"], ["Veg"], "images/coffee_bean_latte.png"),
        ("Classic Cappuccino", "Coffee", 220, 290, ["Double Espresso", "Foamed Milk", "Cocoa Powder"], ["Veg"], "images/coffee_bean_latte.png"),
        ("Belgian Chocolate Cake Slice", "Pastries", 280, 360, ["Dark Belgian Chocolate", "Sponge Cake", "Fudge Glaze"], ["Veg"], "images/default_food.png"),
        ("Butter Croissant", "Bakery", 140, 190, ["French Butter", "Flaky Pastry Dough"], ["Veg"], "images/default_food.png"),
        ("Red Velvet Cupcake", "Pastries", 160, 220, ["Red Velvet Sponge", "Cream Cheese Frosting"], ["Veg"], "images/default_food.png"),
        ("Cold Brew Coffee", "Coffee", 240, 310, ["12-hour Steeped Coffee", "Ice"], ["Veg"], "images/coffee_bean_latte.png"),
        ("Avocado Egg Toast", "Breakfast", 320, 420, ["Sourdough Toast", "Mashed Avocado", "Poached Egg", "Chili Flakes"], ["Non-Veg"], "images/default_food.png"),
        ("Blueberry Cheesecake", "Pastries", 310, 400, ["Baked Cream Cheese", "Graham Crust", "Blueberry Compote"], ["Veg"], "images/default_food.png"),
        ("Spanish Latte", "Coffee", 270, 350, ["Espresso", "Condensed Milk", "Fresh Milk"], ["Veg"], "images/coffee_bean_latte.png"),
        ("Chicken Cheese Panini", "Sandwich", 290, 380, ["Grilled Focaccia", "Chicken Breast", "Mozzarella", "Pesto"], ["Non-Veg"], "images/default_food.png"),
        ("Matcha Green Tea Latte", "Drinks", 280, 360, ["Uji Matcha", "Steamed Milk", "Honey"], ["Veg"], "images/default_food.png"),
        ("Fudgy Brownie with Ice Cream", "Dessert", 220, 290, ["Warm Walnut Brownie", "Vanilla Scoop"], ["Veg"], "images/default_food.png"),
        ("Smoked Salmon Bagel", "Sandwich", 420, 540, ["Toasted Bagel", "Cream Cheese", "Smoked Salmon", "Capers"], ["Non-Veg"], "images/default_food.png"),
        ("Hot Chocolate with Marshmallows", "Drinks", 240, 310, ["Cocoa", "Whole Milk", "Mini Marshmallows"], ["Veg"], "images/default_food.png"),
        ("Tiramisu Dessert Cup", "Dessert", 290, 370, ["Ladyfingers", "Espresso", "Mascarpone Cheese", "Cocoa"], ["Veg"], "images/default_food.png"),
        ("Lemon Tart", "Pastries", 180, 250, ["Shortcrust Shell", "Tangy Lemon Curd", "Meringue"], ["Veg"], "images/default_food.png"),
        ("Hazelnut Cold Coffee", "Coffee", 250, 320, ["Espresso", "Hazelnut Syrup", "Ice Milk"], ["Veg"], "images/coffee_bean_latte.png"),
        ("Garlic Cheese Bread", "Bakery", 160, 220, ["Baguette", "Garlic Butter", "Melted Mozzarella"], ["Veg"], "images/default_food.png"),
        ("Peach Iced Tea", "Drinks", 180, 240, ["Black Tea", "Peach Syrup", "Mint Leaves", "Ice"], ["Veg"], "images/default_food.png"),
        ("Almond Croissant", "Bakery", 170, 230, ["Flaky Pastry", "Almond Cream Filling", "Sliced Almonds"], ["Veg"], "images/default_food.png"),
    ],
    "Steak & BBQ": [
        ("Prime Ribeye Steak (300g)", "Steak", 1200, 1600, ["Imported Beef Ribeye", "Garlic Herb Butter", "Mashed Potato", "Black Pepper Sauce"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("Tenderloin Sizzling Steak", "Steak", 980, 1350, ["Beef Tenderloin", "Hot Iron Plate", "Sautéed Vegetables", "Fries"], ["Non-Veg"], "images/default_food.png"),
        ("Smokey BBQ Chicken Quarter", "BBQ", 320, 420, ["Charcoal Grilled Chicken", "BBQ Sauce", "Garlic Bread"], ["Non-Veg"], "images/default_food.png"),
        ("Tandoori Chicken Full", "BBQ", 580, 750, ["Whole Chicken", "Yogurt Tandoori Marination", "Mint Chutney"], ["Non-Veg"], "images/default_food.png"),
        ("Grilled Lamb Chops (3 pcs)", "Steak", 1100, 1500, ["Lamb Chops", "Rosemary Marination", "Roasted Potatoes"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("BBQ Beef Short Ribs", "BBQ", 950, 1300, ["Slow Smoked Beef Ribs", "Sweet Hickory BBQ Sauce", "Coleslaw"], ["Non-Veg"], "images/default_food.png"),
        ("Grilled Garlic Prawn Skewers", "Seafood", 680, 880, ["Jumbo Prawns", "Garlic Butter", "Lemon Herb Rice"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("T-Bone Steak (350g)", "Steak", 1350, 1800, ["T-Bone Cut", "Mushroom Sauce", "Grilled Corn"], ["Non-Veg"], "images/default_food.png"),
        ("Grilled Salmon Fillet", "Seafood", 1150, 1550, ["Norwegian Salmon", "Dill Cream Sauce", "Asparagus"], ["Non-Veg", "Gluten-Free"], "images/default_food.png"),
        ("Loaded BBQ Pulled Beef Sandwich", "Sandwich", 380, 480, ["Shredded BBQ Beef", "Brioche Bun", "Melted Cheese"], ["Non-Veg"], "images/default_food.png"),
        ("Chicken Sheek Kabab Platter", "BBQ", 420, 550, ["4 Chicken Sheek Kababs", "Paratha", "Mint Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Charcoal Grilled Mixed Platter", "BBQ", 1250, 1650, ["Beef Sheek", "Chicken Boti", "Fish Tikka", "Naan"], ["Non-Veg"], "images/default_food.png"),
        ("Crispy Chicken Wings Platter", "Appetizer", 340, 440, ["12 Wings", "Honey BBQ Dip", "Ranch Dip"], ["Non-Veg"], "images/default_food.png"),
        ("Filet Mignon Steak", "Steak", 1400, 1850, ["Prime Tenderloin Cut", "Truffle Butter", "Red Wine Reduction Sauce"], ["Non-Veg"], "images/default_food.png"),
        ("Grilled Chicken Caesar Salad", "Salad", 320, 410, ["Romaine Lettuce", "Grilled Chicken", "Parmesan", "Croutons"], ["Non-Veg"], "images/default_food.png"),
        ("Beef Boti Kabab", "BBQ", 360, 470, ["Marinated Beef Chunks", "Raw Papaya", "Charcoal Grill"], ["Non-Veg"], "images/default_food.png"),
        ("Mashing Potato Side Bowl", "Sides", 140, 190, ["Butter", "Cream", "Black Pepper"], ["Veg"], "images/default_food.png"),
        ("Grilled Corn on the Cob", "Sides", 120, 160, ["Butter", "Chili Lime Powder"], ["Veg"], "images/default_food.png"),
        ("Creamy Spinach Side", "Sides", 160, 220, ["Fresh Spinach", "Heavy Cream", "Garlic"], ["Veg"], "images/default_food.png"),
        ("BBQ Sauce Extra Dip", "Sides", 50, 80, ["Hickory Smoke BBQ Sauce"], ["Veg"], "images/default_food.png"),
    ]
}

def generate_database():
    restaurants = []
    rest_id_counter = 1

    for city, areas in CITIES_DATA.items():
        for area_info in areas:
            area_name, base_lat, base_lng = area_info
            
            # Determine number of restaurants for this area (8 to 15 restaurants per area)
            num_rests = random.randint(8, 14)
            for i in range(num_rests):
                cuisine_type = random.choice(list(CUISINE_PREFIXES.keys()))
                prefix = random.choice(CUISINE_PREFIXES[cuisine_type])
                
                # Generate unique restaurant name
                name_formats = [
                    f"{prefix} {area_name}",
                    f"{prefix} House {area_name}",
                    f"The {prefix} Club {area_name}",
                    f"{prefix} Express {area_name}",
                    f"Grand {prefix} {area_name}",
                    f"{prefix} Kitchen {area_name}",
                    f"{area_name} {prefix} Spot",
                ]
                rest_name = random.choice(name_formats)
                rest_id = f"{rest_name.lower().replace(' ', '-').replace('&', 'and')}-{rest_id_counter}"
                rest_id_counter += 1

                # Slight random coordinate variation around area center
                lat = round(base_lat + random.uniform(-0.008, 0.008), 5)
                lng = round(base_lng + random.uniform(-0.008, 0.008), 5)

                rating = round(random.uniform(4.1, 4.9), 1)
                review_count = random.randint(45, 650)
                price_range = random.choice(["৳", "৳৳", "৳৳", "৳৳৳"])
                
                phone_prefix = random.choice(["+880 17", "+880 18", "+880 19", "+880 16", "+880 13"])
                phone = f"{phone_prefix}{random.randint(10,99)}-{random.randint(100000, 999999)}"
                
                hours_options = [
                    "11:00 AM - 11:00 PM",
                    "10:00 AM - 10:30 PM",
                    "12:00 PM - 11:30 PM",
                    "08:00 AM - 10:00 PM",
                    "24 Hours"
                ]
                opening_hours = random.choice(hours_options)
                
                street_num = random.randint(1, 120)
                road_num = random.randint(1, 30)
                address = f"House {street_num}, Road {road_num}, {area_name}, {city}"
                
                google_maps_url = f"https://www.google.com/maps/search/?api=1&query={rest_name.replace(' ', '+')}+{city}"

                # Generate 20-30 menu items for this restaurant
                food_template_key = cuisine_type if cuisine_type in FOOD_TEMPLATES else "Biryani & Traditional"
                available_templates = FOOD_TEMPLATES[food_template_key]
                
                # Pick 20 to 25 items randomly, augmenting with price variation
                selected_templates = random.choices(available_templates, k=random.randint(20, 26))
                
                menu_items = []
                popular_items_names = []

                for item_idx, tmpl in enumerate(selected_templates):
                    item_name, item_cat, min_p, max_p, ingredients, dietary, img_url = tmpl
                    
                    item_price = random.randint(min_p // 10, max_p // 10) * 10
                    item_id = f"{rest_id}-item-{item_idx + 1}"
                    badge = random.choice(POPULARITY_BADGES)
                    
                    if badge in ["Top Seller", "Chef Special"] and len(popular_items_names) < 3:
                        popular_items_names.append(item_name)

                    menu_items.append({
                        "id": item_id,
                        "name": item_name,
                        "category": item_cat,
                        "price": item_price,
                        "description": f"Freshly prepared {item_name.lower()} with authentic flavors and ingredients.",
                        "ingredients": ingredients,
                        "popularity_badge": badge,
                        "image_url": img_url,
                        "available": random.random() > 0.05, # 95% available
                        "dietary_tags": dietary
                    })

                if not popular_items_names:
                    popular_items_names = [menu_items[0]["name"], menu_items[1]["name"]]

                # Sample customer reviews
                sample_reviews = [
                    {"user": "Tanvir R.", "rating": round(random.uniform(4.5, 5.0), 1), "text": f"Awesome experience at {rest_name}! The food quality is top notch."},
                    {"user": "Nusrat Jahan", "rating": round(random.uniform(4.0, 4.8), 1), "text": f"Loved the atmosphere and quick service in {area_name}."},
                    {"user": "Farhan Ahmed", "rating": round(random.uniform(4.2, 5.0), 1), "text": "Great value for money. Definitely visiting again!"}
                ]

                restaurant_obj = {
                    "id": rest_id,
                    "name": rest_name,
                    "logo_url": "images/default_food.png",
                    "cover_image_url": menu_items[0]["image_url"],
                    "cuisine": cuisine_type,
                    "location": area_name, # backwards compatibility
                    "area": area_name,
                    "city": city,
                    "address": address,
                    "coordinates": {"lat": lat, "lng": lng},
                    "phone": phone,
                    "opening_hours": opening_hours,
                    "rating": rating,
                    "review_count": review_count,
                    "price_range": price_range,
                    "delivery_available": random.random() > 0.1, # 90% deliver
                    "dine_in_available": True,
                    "takeaway_available": True,
                    "google_maps_url": google_maps_url,
                    "popular_items": popular_items_names,
                    "reviews": sample_reviews,
                    "menu": menu_items
                }
                
                restaurants.append(restaurant_obj)

    return restaurants

if __name__ == "__main__":
    db = generate_database()
    output_path = Path(__file__).parent.parent / "data" / "restaurants.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        
    total_items = sum(len(r["menu"]) for r in db)
    print(f"✅ Generated dataset successfully!")
    print(f"📊 Total Restaurants: {len(db)}")
    print(f"🍕 Total Menu Items: {total_items}")
