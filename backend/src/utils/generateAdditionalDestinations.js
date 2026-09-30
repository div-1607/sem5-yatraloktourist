const fs = require('fs');
const path = require('path');

const regions = [
  {
    name: 'Delhi',
    state: 'Delhi',
    city: 'Delhi',
    baseLat: 28.6139,
    baseLng: 77.2090,
    helpline: '112 / Delhi Police 011-23015555',
    places: [
      { title: 'National Rail Museum', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Crafts Museum & Hastkala Academy', cat: 'Historical Places', fee: '₹20' },
      { title: 'Waste to Wonder Theme Park', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Agrasen ki Baoli Stepwell', cat: 'Historical Places', fee: 'Free' },
      { title: 'Sunder Nursery Heritage Park', cat: 'Tourist Places', fee: '₹40' },
      { title: 'National Gallery of Modern Art', cat: 'Historical Places', fee: '₹20' },
      { title: 'Shankar\'s International Dolls Museum', cat: 'Tourist Places', fee: '₹30' },
      { title: 'Nehru Planetarium & Memorial', cat: 'Tourist Places', fee: '₹80' },
      { title: 'Feroz Shah Kotla Fort & Ashokan Pillar', cat: 'Historical Places', fee: '₹25' },
      { title: 'Safdarjung Tomb & Gardens', cat: 'Historical Places', fee: '₹25' },
      { title: 'Hauz Khas Social & Deer Park Walk', cat: 'Cafes & Restaurants', fee: 'Free' },
      { title: 'Champa Gali Artisanal Lane', cat: 'Cafes & Restaurants', fee: 'Free' },
      { title: 'Khan Market Boutique Boulevard', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Janpath Flea Market & Tibetan Row', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Majnu Ka Tilla Tibetan Colony', cat: 'Old Towns', fee: 'Free' },
      { title: 'Mehrauli Archaeological Park', cat: 'Historical Places', fee: 'Free' },
      { title: 'Pradhanmantri Sangrahalaya', cat: 'Tourist Places', fee: '₹100' },
      { title: 'Garden of Five Senses Saidulajab', cat: 'Tourist Places', fee: '₹35' },
      { title: 'Birla Mandir (Laxminarayan Temple)', cat: 'Temples', fee: 'Free' },
      { title: 'Gurudwara Bangla Sahib Serene Sarovar', cat: 'Temples', fee: 'Free' }
    ]
  },
  {
    name: 'Agra',
    state: 'Uttar Pradesh',
    city: 'Agra',
    baseLat: 27.1767,
    baseLng: 78.0081,
    helpline: '112 / UP Tourism 0562-2226431',
    places: [
      { title: 'Itmad-ud-Daulah (Baby Taj)', cat: 'Historical Places', fee: '₹30' },
      { title: 'Mehtab Bagh Moonlight Garden', cat: 'Tourist Places', fee: '₹25' },
      { title: 'Fatehpur Sikri Panch Mahal & Buland Darwaza', cat: 'Historical Places', fee: '₹50' },
      { title: 'Akbar\'s Tomb Sikandra', cat: 'Historical Places', fee: '₹30' },
      { title: 'Chini Ka Rauza Glazed Tomb', cat: 'Historical Places', fee: 'Free' },
      { title: 'Mariam\'s Tomb Sikandra Complex', cat: 'Historical Places', fee: '₹25' },
      { title: 'Aram Bagh (Bagh-i Gul Afshan)', cat: 'Tourist Places', fee: '₹25' },
      { title: 'Jama Masjid Agra Mughal Gate', cat: 'Historical Places', fee: 'Free' },
      { title: 'Guru Ka Taal Gurudwara Sikandra', cat: 'Temples', fee: 'Free' },
      { title: 'Mankameshwar Ancient Shiva Temple', cat: 'Temples', fee: 'Free' },
      { title: 'Bateshwar 101 Temples on Yamuna Ghats', cat: 'Temples', fee: 'Free' },
      { title: 'Kinari Bazaar Traditional Petha Alley', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Sadar Bazaar Handicraft Emporiums', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Pinch of Spice Fine Mughlai Dining', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Sheroes Hangout Cafe by Acid Attack Survivors', cat: 'Cafes & Restaurants', fee: 'Pay As You Wish' },
      { title: 'Taj Nature Walk Biodiversity Forest', cat: 'Tourist Places', fee: '₹40' },
      { title: 'Soor Sarovar Bird Sanctuary & Keetham Lake', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Elephant Conservation and Care Centre SOS', cat: 'Tourist Places', fee: '₹1500' },
      { title: 'Rawatpara Spice & Grain Wholesale Market', cat: 'Old Towns', fee: 'Free' },
      { title: 'Subhash Bazaar Silk & Zari Textiles', cat: 'Shopping Areas', fee: 'Free' }
    ]
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    city: 'Jaipur',
    baseLat: 26.9124,
    baseLng: 75.7873,
    helpline: '112 / Rajasthan Tourist Police 0141-2601936',
    places: [
      { title: 'Nahargarh Fort Sunset Point & Padao', cat: 'Historical Places', fee: '₹50' },
      { title: 'Jaigarh Fort & Jaivana Cannon', cat: 'Historical Places', fee: '₹70' },
      { title: 'Jal Mahal Palace in Man Sagar Lake', cat: 'Tourist Places', fee: 'Free (Viewpoint)' },
      { title: 'Albert Hall State Museum', cat: 'Historical Places', fee: '₹40' },
      { title: 'Galtaji Sun Monkey Temple & Sacred Kunds', cat: 'Temples', fee: 'Free' },
      { title: 'Govind Dev Ji Temple City Palace Complex', cat: 'Temples', fee: 'Free' },
      { title: 'Birla Mandir White Marble Shrine', cat: 'Temples', fee: 'Free' },
      { title: 'Sisodia Rani Ka Bagh & Water Pavilions', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Vidyadhar Garden Terrace Cascades', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Panna Meena Ka Kund Geometric Stepwell', cat: 'Historical Places', fee: 'Free' },
      { title: 'Chokhi Dhani Ethnic Rajasthani Village', cat: 'Tourist Places', fee: '₹900' },
      { title: 'Bapu Bazaar Lac Bangles & Mojaris', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Johari Bazaar Gemstone & Kundan Jewellery', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Tripolia Bazaar Brassware & Textiles', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Anokhi Museum of Hand Printing Amber', cat: 'Tourist Places', fee: '₹30' },
      { title: 'Jawahar Kala Kendra Cultural Hub', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Bar Palladio Royal Peacock Lounge', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Tapri Central Rooftop Chai Lounge', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Jhalana Leopard Safari Reserve', cat: 'Tourist Places', fee: '₹750' },
      { title: 'Chandlai Lake Flamingo Wetland', cat: 'Tourist Places', fee: 'Free' }
    ]
  },
  {
    name: 'Meerut',
    state: 'Uttar Pradesh',
    city: 'Meerut',
    baseLat: 28.9845,
    baseLng: 77.7064,
    helpline: '112 / Meerut Police Control 0121-2660100',
    places: [
      { title: 'Augarnath Temple (Kali Paltan Mandir - 1857 Cradle)', cat: 'Temples', fee: 'Free' },
      { title: 'St. John\'s Church Cantonment (Oldest in North India)', cat: 'Historical Places', fee: 'Free' },
      { title: 'Shaheed Smarak 1857 Sepoy Mutiny Memorial & Museum', cat: 'Historical Places', fee: 'Free' },
      { title: 'Hastinapur Digambar Jain Bada Mandir', cat: 'Temples', fee: 'Free' },
      { title: 'Jambudweep Jain Teerth Sacred Architecture', cat: 'Temples', fee: 'Free' },
      { title: 'Hastinapur Wildlife Sanctuary Ganga Wetland', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Suraj Kund Park & Ancient Pond', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Shri Baba Aughad Nath Sarovar', cat: 'Temples', fee: 'Free' },
      { title: 'Chandi Devi Mandir Nauchandi Ground', cat: 'Temples', fee: 'Free' },
      { title: 'Historic Nauchandi Mela Grounds', cat: 'Historical Places', fee: 'Free' },
      { title: 'Abu Lane High Street Commercial District', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Sadar Bazaar Sports Goods & Cricket Bat Hub', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Ghanta Ghar Clock Tower & Kotwali Bazaar', cat: 'Old Towns', fee: 'Free' },
      { title: 'Begum Bridge Road Electronics & Apparel Market', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Gandhi Bagh Cantt Promenade Gardens', cat: 'Tourist Places', fee: '₹10' },
      { title: 'Company Garden Pine & Floral Conservatory', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Karnal Chowk Historical Granary Hub', cat: 'Old Towns', fee: 'Free' },
      { title: 'Durgabari Kali Bari Temple Thapar Nagar', cat: 'Temples', fee: 'Free' },
      { title: 'Pine & Dine Cantt Garden Cafe', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Devnaagri Cultural Artisan Street', cat: 'Shopping Areas', fee: 'Free' }
    ]
  },
  {
    name: 'Ghaziabad',
    state: 'Uttar Pradesh',
    city: 'Ghaziabad',
    baseLat: 28.6692,
    baseLng: 77.4538,
    helpline: '112 / Ghaziabad Police 0120-2722100',
    places: [
      { title: 'Dudheshwar Nath Mandir 5000-Yr Shiva Shivalaya', cat: 'Temples', fee: 'Free' },
      { title: 'City Forest Ecological Urban Park Hindon River', cat: 'Tourist Places', fee: '₹20' },
      { title: 'Swarna Jayanti Park Indirapuram', cat: 'Tourist Places', fee: '₹10' },
      { title: 'ISKCON Temple Ghaziabad Govinda Corridor', cat: 'Temples', fee: 'Free' },
      { title: 'Mohan Nagar Temple Durga Sthal', cat: 'Temples', fee: 'Free' },
      { title: 'Drizzling Land Water & Amusement Park', cat: 'Tourist Places', fee: '₹650' },
      { title: 'Shipra Mall Entertainment & Retail Promenade', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Mahagun Metro Mall Vaishali High Street', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Indirapuram Habitat Centre Cultural Arena', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Choudhary Charan Singh Park Hindon Riverbank', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Opulent Mall Movie & Food Atrium', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Hindon Air Force Base & Heritage View', cat: 'Airports', fee: 'Restricted / Free Overlook' },
      { title: 'Dasna Ancient Canal & Devi Temple Sthal', cat: 'Historical Places', fee: 'Free' },
      { title: 'Chhapraula Green Bird Eco Reserve', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Turab Nagar Traditional Bridal & Textile Bazaar', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Ghanta Ghar Ghaziabad Heritage Old Market', cat: 'Old Towns', fee: 'Free' },
      { title: 'The G.T. Road Dine & Heritage Kitchen', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Dr. Ram Manohar Lohia Park Sahibabad', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Sai Upvan Botanical & Meditation Reserve', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Modinagar Laxmi Narayan Jain & Hindu Temple', cat: 'Temples', fee: 'Free' }
    ]
  },
  {
    name: 'Faridabad',
    state: 'Haryana',
    city: 'Faridabad',
    baseLat: 28.4089,
    baseLng: 77.3178,
    helpline: '112 / Faridabad Police 0129-2227200',
    places: [
      { title: 'Badkhal Lake & Aravalli Ridgeway', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Surajkund Ancient Amphitheatre & Sun Pool', cat: 'Historical Places', fee: '₹20' },
      { title: 'Raja Nahar Singh Palace (Ballabhgarh Fort)', cat: 'Historical Places', fee: 'Free' },
      { title: 'CITM Lake & Quarry Turquoise Waters', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Asola Bhatti Wildlife Sanctuary Faridabad Border', cat: 'Tourist Places', fee: '₹30' },
      { title: 'Shirdi Sai Baba Temple Sector 29', cat: 'Temples', fee: 'Free' },
      { title: 'Parson Temple (Jharna Temple) Forest Springs', cat: 'Temples', fee: 'Free' },
      { title: 'Town Park Rose Garden & Musical Fountain Sector 12', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Anangpur Dam Ancient 8th Century Waterworks', cat: 'Historical Places', fee: 'Free' },
      { title: 'Crown Interiorz Mall & Entertainment Complex', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Pebble Downtown Mall & Cinepolis Arena', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'NIT Faridabad Market No. 1 Street Shopping', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Old Faridabad Haveli Street & Anaaj Mandi', cat: 'Old Towns', fee: 'Free' },
      { title: 'Bhangrola Hills Aravalli Trekking Route', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Camp Wild Dhauj Adventure Rock Climbing Camp', cat: 'Tourist Places', fee: '₹1200' },
      { title: 'Jawahar Colony Traditional Bazaar', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Silver City Forest Eco Retreat Surajkund', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Sanatan Dharam Mandir Sector 15 Complex', cat: 'Temples', fee: 'Free' },
      { title: 'Brewberrys Sector 14 Rooftop Roastery', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Leisure Valley Greens Sector 21C', cat: 'Tourist Places', fee: 'Free' }
    ]
  },
  {
    name: 'Goa',
    state: 'Goa',
    city: 'Goa',
    baseLat: 15.2993,
    baseLng: 74.1240,
    helpline: '112 / Goa Tourist Police 0832-2420822',
    places: [
      { title: 'Dudhsagar Waterfalls & Western Ghats Railway', cat: 'Tourist Places', fee: '₹100 + Jeep' },
      { title: 'Fort Aguada & 1864 Portuguese Lighthouse', cat: 'Historical Places', fee: '₹50' },
      { title: 'Chapora Fort (Dil Chahta Hai Vantage Point)', cat: 'Historical Places', fee: 'Free' },
      { title: 'Reis Magos Fort Mandovi Estuary', cat: 'Historical Places', fee: '₹50' },
      { title: 'Fontainhas Latin Quarter Colourful Portuguese Villas', cat: 'Old Towns', fee: 'Free' },
      { title: 'Palolem Beach Crescent & Butterfly Beach Boat', cat: 'Beaches', fee: 'Free' },
      { title: 'Anjuna Flea Market & Rocky Beach Sunset', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Arambol Sweet Water Lake & Bohemian Drum Circle', cat: 'Beaches', fee: 'Free' },
      { title: 'Baga Beach Watersports & Tito\'s Lane', cat: 'Beaches', fee: 'Free' },
      { title: 'Calangute Queen of Beaches & Seaside Shacks', cat: 'Beaches', fee: 'Free' },
      { title: 'Morjim Olive Ridley Turtle Nesting Beach', cat: 'Beaches', fee: 'Free' },
      { title: 'Ashwem & Mandrem Tranquil White Sands', cat: 'Beaches', fee: 'Free' },
      { title: 'Shanta Durga Temple Kavlem Spiritual Complex', cat: 'Temples', fee: 'Free' },
      { title: 'Mangueshi Shiva Temple Priol Goan Architecture', cat: 'Temples', fee: 'Free' },
      { title: 'Sahakari Spice Farm Ponda Guided Tour & Lunch', cat: 'Tourist Places', fee: '₹500' },
      { title: 'Bhagwan Mahavir Wildlife Sanctuary & Mollem Forest', cat: 'Tourist Places', fee: '₹30' },
      { title: 'Thalassa Greek Taverna Siolim Water View', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Curlies Legendary Sunset Beach Shack Anjuna', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Mapusa Friday Traditional Produce Market', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Dabolim & MOPA International Terminals', cat: 'Airports', fee: 'Ticketed Passengers' }
    ]
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    city: 'Mumbai',
    baseLat: 18.9220,
    baseLng: 72.8347,
    helpline: '112 / Mumbai Police 022-22620111',
    places: [
      { title: 'Kanheri Caves 109 Buddhist Bas-Reliefs', cat: 'Historical Places', fee: '₹25' },
      { title: 'Sanjay Gandhi National Park Tiger Safari', cat: 'Tourist Places', fee: '₹64' },
      { title: 'Bandra Bandstand & Castella de Aguada Fort', cat: 'Historical Places', fee: 'Free' },
      { title: 'Siddhi Vinayak Ganpati Temple Prabhadevi', cat: 'Temples', fee: 'Free' },
      { title: 'Mahalaxmi Temple & Arabian Sea Promenade', cat: 'Temples', fee: 'Free' },
      { title: 'Haji Ali Dargah Causeway in the Sea', cat: 'Historical Places', fee: 'Free' },
      { title: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya (CSMVS)', cat: 'Historical Places', fee: '₹150' },
      { title: 'Jehangir Art Gallery Kala Ghoda', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Kala Ghoda Heritage Art & Cafe Precinct', cat: 'Old Towns', fee: 'Free' },
      { title: 'Colaba Causeway Antique & Street Shopping Arcade', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Crawford (Mahatma Jyotiba Phule) Market 1869', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Linking Road Bandra Fashion Boulevard', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Juhu Beach Sunset & Pav Bhaji Stalls', cat: 'Beaches', fee: 'Free' },
      { title: 'Versova Beach & Fisherman Rock Village', cat: 'Beaches', fee: 'Free' },
      { title: 'Girgaon Chowpatty & Queen\'s Necklace View', cat: 'Beaches', fee: 'Free' },
      { title: 'Leopold Cafe & Bar Colaba Heritage 1871', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Britannia & Co. Parsi Berry Pulao Ballard Estate', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Babulnath Shiva Temple Hilltop Malabar Hill', cat: 'Temples', fee: 'Free' },
      { title: 'Banganga Sacred Ancient Water Tank Walk', cat: 'Historical Places', fee: 'Free' },
      { title: 'Bandra-Worli Sea Link Engineering Promenade', cat: 'Tourist Places', fee: 'Toll Route' }
    ]
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    city: 'Pune',
    baseLat: 18.5204,
    baseLng: 73.8567,
    helpline: '112 / Pune Police 020-26126296',
    places: [
      { title: 'Shaniwar Wada 1732 Peshwa Fortification', cat: 'Historical Places', fee: '₹25' },
      { title: 'Aga Khan Palace & Gandhi Memorial', cat: 'Historical Places', fee: '₹25' },
      { title: 'Sinhagad Fort Mountain Fortress & Pitla Bhakri', cat: 'Historical Places', fee: '₹50' },
      { title: 'Dagdusheth Halwai Ganpati Temple', cat: 'Temples', fee: 'Free' },
      { title: 'Pataleshwar Cave Temple 8th Century Basalt Rock', cat: 'Historical Places', fee: 'Free' },
      { title: 'Raja Dinkar Kelkar Museum 20,000 Artifacts', cat: 'Historical Places', fee: '₹100' },
      { title: 'Parvati Hilltop Temples & Peshwa Museum', cat: 'Temples', fee: 'Free' },
      { title: 'Chaturshringi Temple Senapati Bapat Road', cat: 'Temples', fee: 'Free' },
      { title: 'Osho Teerth Park & International Meditation Resort', cat: 'Tourist Places', fee: '₹60' },
      { title: 'Pu La Deshpande Japanese Friendship Garden', cat: 'Tourist Places', fee: '₹20' },
      { title: 'FC Road (Fergusson College Rd) Fashion Street', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Tulsi Baug Traditional Maharashtrian Market', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Laxmi Road Traditional Silk & Paithani Saree Hub', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Koregaon Park Tree-Lined Cafes & Breweries', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'German Bakery Koregaon Park Iconic Cafe', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Viman Nagar Phoenix Marketcity Lifestyle Hub', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Pashan Lake Wetland & Bird Watching Deck', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Vetal Tekdi Hilltop Sunrise Trek Point', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Khaskis Point Katraj Snake Park & Zoo', cat: 'Tourist Places', fee: '₹40' },
      { title: 'Lonavala-Khandala Ghats Gateway from Pune', cat: 'Tourist Places', fee: 'Free' }
    ]
  },
  {
    name: 'Jammu and Kashmir',
    state: 'Jammu and Kashmir',
    city: 'Srinagar',
    baseLat: 34.0837,
    baseLng: 74.7973,
    helpline: '112 / JK Tourism Helpline 0194-2502279',
    places: [
      { title: 'Dal Lake Shikara Cruise & Floating Market', cat: 'Tourist Places', fee: '₹700 / Hr' },
      { title: 'Mughal Gardens Shalimar Bagh Terraces', cat: 'Historical Places', fee: '₹24' },
      { title: 'Nishat Bagh (Garden of Bliss) on Dal Shore', cat: 'Historical Places', fee: '₹24' },
      { title: 'Chashme Shahi Natural Spring Garden', cat: 'Tourist Places', fee: '₹24' },
      { title: 'Pari Mahal Palace of Fairies Zabarwan Range', cat: 'Historical Places', fee: '₹24' },
      { title: 'Indira Gandhi Memorial Tulip Garden', cat: 'Tourist Places', fee: '₹75' },
      { title: 'Hazratbal Shrine Silver Dome on Dal Lake', cat: 'Temples', fee: 'Free' },
      { title: 'Shankaracharya Shiva Temple Gopadari Hill', cat: 'Temples', fee: 'Free' },
      { title: 'Jamia Masjid Srinagar 370 Deodar Pillars', cat: 'Historical Places', fee: 'Free' },
      { title: 'Gulmarg Gondola & Apharwat Peak Snowfields', cat: 'Tourist Places', fee: '₹800 - ₹1800' },
      { title: 'Pahalgam Betaab Valley & Sheshnag Stream', cat: 'Tourist Places', fee: '₹100' },
      { title: 'Aru Valley & Overa-Aru Biosphere Reserve', cat: 'Tourist Places', fee: '₹50' },
      { title: 'Sonamarg Meadow of Gold & Thajiwas Glacier', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Vaishno Devi Bhawan Katra Holy Cave Shrine', cat: 'Temples', fee: 'Free' },
      { title: 'Bahu Fort & Kali Temple Tawi River Jammu', cat: 'Historical Places', fee: '₹10' },
      { title: 'Raghunath Temple Jammu City Center', cat: 'Temples', fee: 'Free' },
      { title: 'Lal Chowk & Ghanta Ghar Downtown Heritage Walk', cat: 'Old Towns', fee: 'Free' },
      { title: 'Polo View High Street Handicraft & Walnut Wood Market', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Ahdoos Kashmiri Wazwan Heritage Restaurant 1918', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Chai Jaai Kashmiri Tea & Bakery Room Bund', cat: 'Cafes & Restaurants', fee: 'Free Entry' }
    ]
  },
  {
    name: 'Haryana',
    state: 'Haryana',
    city: 'Haryana',
    baseLat: 29.0588,
    baseLng: 76.0856,
    helpline: '112 / Haryana Tourism 0172-2702955',
    places: [
      { title: 'Sultanpur National Park Migratory Bird Sanctuary', cat: 'Tourist Places', fee: '₹5' },
      { title: 'Cyber Hub Gurugram Urban Dine & Social Arena', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Kingdom of Dreams Cultural Pavilion Gurugram', cat: 'Tourist Places', fee: '₹600' },
      { title: 'Sheetla Mata Mandir Gurugram Shitala Devi', cat: 'Temples', fee: 'Free' },
      { title: 'Brahma Sarovar Sacred Water Basin Kurukshetra', cat: 'Historical Places', fee: 'Free' },
      { title: 'Jyotisar Birthplace of Bhagavad Gita Kurukshetra', cat: 'Historical Places', fee: 'Free' },
      { title: 'Sheikh Chilli\'s Tomb Persian Marble Mausoleum', cat: 'Historical Places', fee: '₹25' },
      { title: 'Panorama & Science Centre Kurukshetra Battleground', cat: 'Tourist Places', fee: '₹40' },
      { title: 'Yadavindra Mughal Gardens Pinjore Terraces', cat: 'Historical Places', fee: '₹25' },
      { title: 'Morni Hills Pine Forests & Tikkar Taal Lake', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Cactus Garden Panchkula Asia\'s Largest Succulents', cat: 'Tourist Places', fee: '₹10' },
      { title: 'Mansadevi Temple Panchkula Himalayan Shivalik', cat: 'Temples', fee: 'Free' },
      { title: 'Kabuli Bagh Mosque Babur\'s 1526 Victory Panipat', cat: 'Historical Places', fee: 'Free' },
      { title: 'Panipat Battleground Museum & Kala Amb Memorial', cat: 'Historical Places', fee: '₹20' },
      { title: 'Karna Lake Oasis Grand Trunk Road Karnal', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Ambika Devi Mandir Historic Ambala Cantt', cat: 'Temples', fee: 'Free' },
      { title: 'Rakhigarhi Indus Valley Harappan Site & Museum', cat: 'Historical Places', fee: 'Free' },
      { title: 'Ambience Mall Gurugram 1 Km Shopping Promenade', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Sadar Bazaar Gurugram Haryanvi Sweets & Textiles', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Aravalli Biodiversity Park Gurugram Nature Trail', cat: 'Tourist Places', fee: 'Free' }
    ]
  },
  {
    name: 'Punjab',
    state: 'Punjab',
    city: 'Punjab',
    baseLat: 31.1471,
    baseLng: 75.3412,
    helpline: '112 / Punjab Tourism 0172-2704570',
    places: [
      { title: 'Wagah Border Beating Retreat Ceremony Amritsar', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Jallianwala Bagh Historic Memorial & Martyr Well', cat: 'Historical Places', fee: 'Free' },
      { title: 'Partition Museum Town Hall Amritsar', cat: 'Historical Places', fee: '₹10' },
      { title: 'Gobindgarh Fort & Toshakhana Coin Museum', cat: 'Historical Places', fee: '₹180' },
      { title: 'Durgiana Temple (Lakshmi Narayan Silver Temple)', cat: 'Temples', fee: 'Free' },
      { title: 'Ram Bagh & Maharaja Ranjit Singh Summer Palace', cat: 'Historical Places', fee: '₹10' },
      { title: 'Qila Mubarak Royal Palace of Patiala', cat: 'Historical Places', fee: '₹20' },
      { title: 'Sheesh Mahal Palace of Mirrors & Suspension Bridge Patiala', cat: 'Historical Places', fee: '₹20' },
      { title: 'Baradari Gardens Imperial Royal Arboretum Patiala', cat: 'Tourist Places', fee: 'Free' },
      { title: 'Virasat-e-Khalsa Museum Anandpur Sahib', cat: 'Historical Places', fee: 'Free' },
      { title: 'Takht Sri Keshgarh Sahib Birthplace of Khalsa', cat: 'Temples', fee: 'Free' },
      { title: 'Jagatjit Palace Versailles of Punjab Kapurthala', cat: 'Historical Places', fee: 'Free' },
      { title: 'Moorish Mosque Moroccan Marvel Kapurthala', cat: 'Historical Places', fee: 'Free' },
      { title: 'Pushpa Gujral Science City Jalandhar Kapurthala', cat: 'Tourist Places', fee: '₹140' },
      { title: 'Devi Talab Mandir 200-Year Shakti Peeth Jalandhar', cat: 'Temples', fee: 'Free' },
      { title: 'Qila Mubarak Bathinda Razia Sultana Imprisonment', cat: 'Historical Places', fee: 'Free' },
      { title: 'Punjab Agricultural University Rural Museum Ludhiana', cat: 'Tourist Places', fee: '₹20' },
      { title: 'Kesar Da Dhaba Amritsar Authentic 1916 Dal Makhani', cat: 'Cafes & Restaurants', fee: 'Free Entry' },
      { title: 'Hall Bazaar Amritsar Woolens & Phulkari Embroidery', cat: 'Shopping Areas', fee: 'Free' },
      { title: 'Harike Wetland & Ramsar Bird Sanctuary Tarn Taran', cat: 'Tourist Places', fee: 'Free' }
    ]
  }
];

const crowdCycle = ['low', 'moderate', 'high'];
const imagesList = [
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
  'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=1200',
  'https://images.unsplash.com/photo-1588096344356-9a2f7c0a9fc6?w=1200',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200'
];

let allNewDestinations = [];

regions.forEach((reg, regIdx) => {
  reg.places.forEach((pl, pIdx) => {
    const crowd = crowdCycle[(regIdx + pIdx) % 3];
    const crowdPct = crowd === 'low' ? 22 + (pIdx * 2) : crowd === 'moderate' ? 52 + (pIdx * 2) : 82 + (pIdx % 15);
    const img1 = imagesList[(regIdx * 2 + pIdx) % imagesList.length];
    const img2 = imagesList[(regIdx * 2 + pIdx + 3) % imagesList.length];
    
    // Spread coordinates slightly around city center
    const latOffset = ((pIdx % 5) - 2) * 0.015;
    const lngOffset = (Math.floor(pIdx / 5) - 2) * 0.015;
    const lat = Number((reg.baseLat + latOffset).toFixed(4));
    const lng = Number((reg.baseLng + lngOffset).toFixed(4));

    allNewDestinations.push({
      title: pl.title,
      country: 'India',
      state: reg.state,
      city: reg.city,
      category: pl.cat,
      description: `${pl.title} is an acclaimed destination located in ${reg.city}, ${reg.state}. Celebrated by tourists and locals alike for its extraordinary ambience, vibrant culture, and remarkable heritage value.`,
      shortDescription: `Top-rated ${pl.cat.toLowerCase()} landmark in ${reg.city}, ${reg.state} offering rich experiences for visitors.`,
      images: [img1, img2],
      location: {
        lat,
        lng,
        address: `${pl.title}, ${reg.city}, ${reg.state}`
      },
      crowdStatus: crowd,
      crowdPercentage: Math.min(99, Math.max(15, crowdPct)),
      rating: Number((4.3 + ((regIdx + pIdx) % 7) * 0.1).toFixed(1)),
      numReviews: 45 + ((regIdx * 7 + pIdx * 11) % 150),
      isPopular: (pIdx % 3 === 0),
      entryFee: pl.fee,
      timings: pl.cat === 'Temples' ? '05:00 AM - 09:00 PM' : '09:00 AM - 06:30 PM',
      bestTimeToVisit: 'October to March',
      emergencyHelpline: reg.helpline,
      tags: [reg.city, reg.state, pl.cat, 'Tourism', 'Yatra Lok Verified']
    });
  });
});

console.log(`Generated ${allNewDestinations.length} destinations across ${regions.length} regions.`);

const content = `/**
 * Auto-generated 240 Destinations (20 each for 12 cities/regions)
 */
module.exports = ${JSON.stringify(allNewDestinations, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'additionalDestinations.js'), content, 'utf8');
console.log('Saved to additionalDestinations.js successfully!');
