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

async function getLayers() {
    const [rows] = await connection.query('SELECT item_id, clothing_name FROM clothing_item WHERE clothing_type = "layer"');
    return rows;
}

async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    });

    // Home route to fetch client-side combinations and clothing items
    app.get('/combinations', async (req, res) => {
        const layers = await getLayers();

        // note: When this line is executed, Express will look for the index.hbs file in the views directory, compile it, and inject the provided data (combinations and layers) into the template.
        // The resulting HTML is then sent back to the client as the response to their HTTP request.
        res.render('index', { combinations, layers });
    });

    // Route to update the clothing combination. The user can only add layer. The rest of the clothing items are the basics: bottom, top, shoes, bags. Layer is optional.
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
        const { combo_num, bottom_id, top_id, shoes_id, bag_id, layer_id } = req.body;

        // Insert the favorite into the database
        await connection.execute(`
            INSERT INTO favorite (combo_num, bottom_id, top_id, shoes_id, bag_id, layer_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [combo_num, bottom_id, top_id, shoes_id, bag_id, layer_id || null]);

        // Execute the query to fetch the favorites
        const query = `
            SELECT 
                b.clothing_name AS bottom_name,
                t.clothing_name AS top_name,
                g.clothing_name AS bag_name,
                s.clothing_name AS shoes_name,
                l.clothing_name AS layer_name,
                f.combo_num
            FROM 
                favorite f
            LEFT JOIN 
                clothing_item b ON f.bottom_id = b.item_id
            LEFT JOIN 
                clothing_item t ON f.top_id = t.item_id
            LEFT JOIN 
                clothing_item g ON f.bag_id = g.item_id
            LEFT JOIN 
                clothing_item s ON f.shoes_id = s.item_id
            LEFT JOIN 
                clothing_item l ON f.layer_id = l.item_id
            WHERE 
                f.favorite_id IS NOT NULL;  
        `;

        // Fetch the favorites data
        const [favorites] = await connection.query(query);

        // Render the favorites view with the retrieved data
        res.render('favorites', { favorites });
    });


    app.get('/favorites', async (req, res) => {
        try {
            const query = `
            SELECT 
                f.favorite_id,
                b.clothing_name AS bottom_name,
                t.clothing_name AS top_name,
                g.clothing_name AS bag_name,
                s.clothing_name AS shoes_name,
                l.clothing_name AS layer_name,
                f.combo_num
            FROM 
                favorite f
            LEFT JOIN 
                clothing_item b ON f.bottom_id = b.item_id
            LEFT JOIN 
                clothing_item t ON f.top_id = t.item_id
            LEFT JOIN 
                clothing_item g ON f.bag_id = g.item_id
            LEFT JOIN 
                clothing_item s ON f.shoes_id = s.item_id
            LEFT JOIN 
                clothing_item l ON f.layer_id = l.item_id
            WHERE 
                f.favorite_id IS NOT NULL;  
                    `;

            const [favorites] = await connection.query(query);
            console.log(favorites);

            res.render('favorites', { favorites });
        } catch (error) {
            console.error("Error fetching favorites:", error);
            res.status(500).send("Error retrieving favorites data");
        }
    });

    app.post('/favorites/delete', async (req, res) => {
        const favoriteId = req.body.favorite_id;

        await connection.query('DELETE FROM favorite WHERE favorite_id = ?', [favoriteId]);
        res.redirect('/favorites');
    })


    app.listen(3000, () => {
        console.log('Server is running on http://127.0.0.1:3000');
    });
}

main()
