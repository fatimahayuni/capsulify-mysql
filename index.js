const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
require('dotenv').config();
const { createConnection } = require('mysql2/promise');

let app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Require in handlebars and their helpers
const helpers = require('handlebars-helpers');

// Tell handlebars-helpers where to find handlebars
helpers({
    'handlebars': hbs.handlebars
});

let connection;

// Hardcoded combinations from the client-side. 
// In Capsulify, we will use this as the generated combos from the client-side.
const combinations = [
    {
        combo_num: 1,
        bottom: { id: '1', name: 'Black Formal Pants' },
        top: { id: '4', name: 'Black Collared Shirt' },
        shoes: { id: '7', name: 'Black Pumps' },
        bag: { id: '10', name: 'Black Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 2,
        bottom: { id: '2', name: 'Denim Jeans' },
        top: { id: '5', name: 'White Top' },
        shoes: { id: '9', name: 'Sneakers' },
        bag: { id: '11', name: 'Beige Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 3,
        bottom: { id: '2', name: 'Denim Jeans' },
        top: { id: '6', name: 'Accent-Colored Blouse' },
        shoes: { id: '9', name: 'Sneakers' },
        bag: { id: '11', name: 'Beige Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 4,
        bottom: { id: '3', name: 'Blue Skirt' },
        top: { id: '5', name: 'White Top' },
        shoes: { id: '8', name: 'Beige Heels' },
        bag: { id: '12', name: 'Black Clutch' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 5,
        bottom: { id: '1', name: 'Black Formal Pants' },
        top: { id: '6', name: 'Accent-Colored Blouse' },
        shoes: { id: '7', name: 'Black Pumps' },
        bag: { id: '11', name: 'Beige Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 6,
        bottom: { id: '2', name: 'Denim Jeans' },
        top: { id: '4', name: 'Black Collared Shirt' },
        shoes: { id: '9', name: 'Sneakers' },
        bag: { id: '10', name: 'Black Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 7,
        bottom: { id: '3', name: 'Blue Skirt' },
        top: { id: '6', name: 'Accent-Colored Blouse' },
        shoes: { id: '8', name: 'Beige Heels' },
        bag: { id: '12', name: 'Black Clutch' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 8,
        bottom: { id: '1', name: 'Black Formal Pants' },
        top: { id: '5', name: 'White Top' },
        shoes: { id: '7', name: 'Black Pumps' },
        bag: { id: '11', name: 'Beige Tote' },
        layer: { id: '', name: '' } // empty because layer is optional
    },
    {
        combo_num: 9,
        bottom: { id: '2', name: 'Denim Jeans' },
        top: { id: '4', name: 'Black Collared Shirt' },
        shoes: { id: '9', name: 'Sneakers' },
        bag: { id: '10', name: 'Black Tote' },
        layer: { id: '13', name: 'Black Cardigan' } // added a layer for this combination
    },
    {
        combo_num: 10,
        bottom: { id: '3', name: 'Blue Skirt' },
        top: { id: '5', name: 'White Top' },
        shoes: { id: '8', name: 'Beige Heels' },
        bag: { id: '12', name: 'Black Clutch' },
        layer: { id: '15', name: 'Parka' } // added a layer for this combination
    }
];


// Function to fetch layers
async function getLayers() {
    const [rows] = await connection.query('SELECT item_id, clothing_name FROM clothing_item WHERE clothing_type = "layer"');
    return rows;
}

// Function to fetch earrings
async function getEarrings() {
    const [rows] = await connection.query('SELECT item_id, clothing_name AS earring_name FROM clothing_item WHERE clothing_type = "earring"');
    return rows;
}

// Function to fetch accessories
async function getAccessories() {
    const [rows] = await connection.query('SELECT item_id, clothing_name AS accessory_name FROM clothing_item WHERE clothing_type = "accessory"');
    return rows;
}

async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    });

    // Home route to fetch combinations and clothing items
    app.get('/combinations', async (req, res) => {
        const layers = await getLayers();

        // note: When this line is executed, Express will look for the index.hbs file in the views directory, compile it, and inject the provided data (combinations, layers, and accessories) into the template.
        // The resulting HTML is then sent back to the client as the response to their HTTP request.
        res.render('index', { combinations, layers });
    });

    // Update route for clothing combinations
    app.post('/update', async (req, res) => {
        const { combo_id,
            layers: selectedLayers }
            = req.body;

        // Fetch layer name only if a layer is selected
        let layerName = "";
        if (selectedLayers) {
            const [selectedLayer] = await connection.query('SELECT clothing_name FROM clothing_item WHERE item_id = ?', [selectedLayers]);
            layerName = selectedLayer[0] ? selectedLayer[0].clothing_name : "";
        }

        // Update the combinations array
        //todo is this even important? i guess once a user updates the combos, she will mark it as favorite. so leave it first?
        const updatedCombinations = combinations.map(combo => {
            if (combo.combo_id === combo_id) {
                return {
                    ...combo,
                    layer_name: layerName, // Update only if a layer is selected
                };
            }
            return combo;
        });


        // Update the global combinations variable
        combinations = updatedCombinations;

        // Re-render the index view with updated combinations
        const updatedLayers = await getLayers();

        res.render('index', { combinations: updatedCombinations, layers: updatedLayers });
    });

    // Route to handle favoriting a combination and storing it in a database. 
    app.post('/favorite', async (req, res) => {
        const { combo_id, bottom_id, top_id, shoes_id, bag_id, layer_id } = req.body;
        console.log("Combo ID:", combo_id);
        console.log("Bottom ID:", bottom_id);
        console.log("Top ID:", top_id);
        console.log("Shoes ID:", shoes_id);
        console.log("Bag ID:", bag_id);
        console.log("Layer ID:", layer_id);

        try {
            // Insert favorite combo into database
            const [result] = await connection.execute(`
                INSERT INTO favorite (combo_id, bottom_id, top_id, shoes_id, bag_id, layer_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [combo_id, bottom_id, top_id, shoes_id, bag_id, layer_id || null]); // Use null if layer_id is undefined

            res.status(201).json({ message: "Favorite saved successfully!", favoriteId: result.insertId });
        } catch (error) {
            console.error("Error saving favorite:", error);
            res.status(500).json({ message: "Error saving favorite." });
        }
    });



    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

main()
