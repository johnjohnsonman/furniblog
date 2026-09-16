const fs = require("node:fs");

const candidates = [
  // Mexico — official brand showroom and dealer pages.
  ["hm-mexico-city-showroom","Herman Miller Mexico City Showroom","MX","Mexico City","CDMX","Anillo Periférico Sur 4690, Jardines del Pedregal, Coyoacán, 04500 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","unknown","Herman Miller"],
  ["hm-monterrey-showroom","Herman Miller Monterrey Showroom","MX","San Pedro Garza García","Nuevo León","Parque Arboleda, Avenida Roble 660, Local 108 East, Valle del Campestre, San Pedro Garza García, Nuevo León 66266","America/Monterrey","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["hm-casa-palacio-antara","Casa Palacio Antara","MX","Mexico City","CDMX","Avenida Ejército Nacional Mexicano 843-B, Granada, Miguel Hidalgo, 11520 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["hm-palacio-coyoacan","El Palacio de Hierro Coyoacán","MX","Mexico City","CDMX","Real Mayorazgo 130, Xoco, Benito Juárez, 03339 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["hm-palacio-perisur","El Palacio de Hierro Perisur","MX","Mexico City","CDMX","Anillo Periférico Sur 4690, Jardines del Pedregal, Coyoacán, 04500 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["hm-palacio-polanco","El Palacio de Hierro Polanco","MX","Mexico City","CDMX","Avenida Moliere 222, Polanco II Sección, Miguel Hidalgo, 11530 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["hm-palacio-queretaro","El Palacio de Hierro Querétaro","MX","Querétaro","Querétaro","Paseo de la República 12401, Jurica, 76127 Querétaro","America/Mexico_City","https://store.hermanmiller.com.mx/showroom","walk_in","Herman Miller"],
  ["dwr-mexico-city-palmas","DWR Mexico City Palmas","MX","Mexico City","CDMX","Paseo de las Palmas 260-B, Lomas de Chapultepec, 11000 Ciudad de México","America/Mexico_City","https://store.hermanmiller.com/store?StoreId=35&lang=en_US","walk_in","Herman Miller"],
  ["haworth-papsa-mexico-city","PAPSA Mexico City","MX","Mexico City","CDMX","Paseo de la Reforma 2620 Piso 10, Lomas Altas, 11950 Ciudad de México","America/Mexico_City","https://www.haworth.com/na/en/about/about-haworth/mexico.html","required","Haworth"],
  ["haworth-papsa-monterrey","PAPSA Monterrey","MX","San Pedro Garza García","Nuevo León","Avenida Roble 660 Piso 12-01, Valle del Campestre, San Pedro Garza García, Nuevo León 66265","America/Monterrey","https://www.haworth.com/na/en/about/about-haworth/mexico.html","required","Haworth"],
  ["haworth-papsa-guadalajara","PAPSA Guadalajara","MX","Zapopan","Jalisco","Boulevard Puerta de Hierro 5153, Piso 2, 45116 Zapopan, Jalisco","America/Mexico_City","https://www.haworth.com/na/en/about/about-haworth/mexico.html","required","Haworth"],
  ["haworth-essmed-mexico-city","ESSMED Mexico City","MX","Mexico City","CDMX","Prolongación Paseo de la Reforma 1015, Edificio B-301, Santa Fe, Ciudad de México","America/Mexico_City","https://www.haworth.com/na/en/about/about-haworth/mexico.html","required","Haworth"],
  ["haworth-simo-tijuana","SIMO Tijuana","MX","Tijuana","Baja California","Boulevard Salinas 10576 Interior 100-B, Aviación, Tijuana, Baja California 22014","America/Tijuana","https://www.haworth.com/na/en/about/about-haworth/mexico.html","required","Haworth"],
  ["humanscale-ergolab-mexico","Humanscale Mexico ErgoLab","MX","Mexico City","CDMX","Juan Salvador Agraz 61-401, Santa Fe, Cuajimalpa, 05348 Ciudad de México","America/Mexico_City","https://latam.humanscale.com/about/company-overview/locations.cfm","required","Humanscale"],
  ["humanscale-nogales","Humanscale Nogales","MX","Nogales","Sonora","Calzada Industrial de las Maquiladoras 190, Nueva Nogales, Nogales, Sonora 84094","America/Hermosillo","https://latam.humanscale.com/about/company-overview/locations.cfm","required","Humanscale"],

  // New Zealand — specialist workplace and furniture showrooms.
  ["europlan-auckland","Europlan Auckland","NZ","Auckland","Auckland","125 The Strand, Parnell, Auckland 1010","Pacific/Auckland","https://europlan.nz/locations/","unknown"],
  ["europlan-wellington","Europlan Wellington","NZ","Wellington","Wellington","Unit 4 Ground Floor, 262 Thorndon Quay, Pipitea, Wellington 6011","Pacific/Auckland","https://europlan.nz/locations/","unknown"],
  ["europlan-christchurch","Europlan Christchurch","NZ","Christchurch","Canterbury","79 Gloucester Street, Christchurch 8013","Pacific/Auckland","https://europlan.nz/locations/","unknown"],
  ["crestline-auckland","Crestline Auckland","NZ","Auckland","Auckland","106 St Georges Bay Road, Parnell, Auckland 1052","Pacific/Auckland","https://crestline.co.nz/","required"],
  ["crestline-hamilton","Crestline Hamilton","NZ","Hamilton","Waikato","19 The Boulevard, Te Rapa, Hamilton 3200","Pacific/Auckland","https://crestline.co.nz/","required"],
  ["crestline-wellington","Crestline Wellington","NZ","Wellington","Wellington","14 Allen Street, Te Aro, Wellington 6011","Pacific/Auckland","https://crestline.co.nz/","required"],
  ["crestline-christchurch","Crestline Christchurch","NZ","Christchurch","Canterbury","79 Lichfield Street, Christchurch 8011","Pacific/Auckland","https://crestline.co.nz/","required"],
  ["ecc-auckland","ECC Auckland","NZ","Auckland","Auckland","39 Nugent Street, Grafton, Auckland 1023","Pacific/Auckland","https://ecc.co.nz/contact","walk_in"],
  ["ecc-wellington","ECC Wellington","NZ","Wellington","Wellington","61 Thorndon Quay, Thorndon, Wellington 6011","Pacific/Auckland","https://ecc.co.nz/contact","walk_in"],
  ["ecc-christchurch-home","ECC Christchurch Home","NZ","Christchurch","Canterbury","145 Victoria Street, Christchurch Central, Christchurch 8013","Pacific/Auckland","https://ecc.co.nz/contact","walk_in"],
  ["ecc-christchurch-professional","ECC Christchurch Professional","NZ","Christchurch","Canterbury","143A Victoria Street, Christchurch Central, Christchurch 8013","Pacific/Auckland","https://ecc.co.nz/contact","walk_in"],
  ["ecc-auckland-outlet","ECC Auckland Outlet","NZ","Auckland","Auckland","57 Boston Road, Grafton, Auckland 1023","Pacific/Auckland","https://ecc.co.nz/contact","walk_in"],
  ["silentpod-auckland","Silent Pod Auckland","NZ","Auckland","Auckland","Level 9, 4 Williamson Avenue, Ponsonby, Auckland 1021","Pacific/Auckland","https://silentpod.co.nz/contact-us/","required"],
  ["silentpod-wellington","Silent Pod Wellington","NZ","Wellington","Wellington","Precinct Flex Bowen Campus, 40 Bowen Street, Wellington 6011","Pacific/Auckland","https://silentpod.co.nz/contact-us/","required"],
  ["silentpod-christchurch","Silent Pod Christchurch","NZ","Christchurch","Canterbury","18 Bernard Street, Addington, Christchurch 8024","Pacific/Auckland","https://silentpod.co.nz/contact-us/","required"],
  ["aspect-auckland","Aspect Furniture Auckland","NZ","Auckland","Auckland","107 St Georges Bay Road, Parnell, Auckland 1052","Pacific/Auckland","https://aspectfurniture.com/our-locations","required"],
  ["aspect-hamilton","Aspect Furniture Hamilton","NZ","Hamilton","Waikato","14 Garden Place, Hamilton Central, Hamilton 3204","Pacific/Auckland","https://aspectfurniture.com/our-locations","required"],
  ["aspect-wellington","Aspect Furniture Wellington","NZ","Wellington","Wellington","Level 4, 40 Bowen Street, Pipitea, Wellington 6011","Pacific/Auckland","https://aspectfurniture.com/our-locations","required"],
  ["aspect-christchurch","Aspect Furniture Christchurch","NZ","Christchurch","Canterbury","Ground Floor, 335 Lincoln Road, Addington, Christchurch 8024","Pacific/Auckland","https://aspectfurniture.com/our-locations","required"],

  // India — current official showroom pages.
  ["haworth-bengaluru","Haworth Bengaluru Showroom","IN","Bengaluru","Karnataka","522/1 Chinmaya Mission Hospital Road, Indiranagar, Bengaluru, Karnataka 560038","Asia/Kolkata","https://www.haworth.com/ap/en/spaces/showrooms/bengaluru-india.html","required","Haworth"],
  ["haworth-chennai","Haworth Chennai Showroom","IN","Chennai","Tamil Nadu","SriNivas Building, 86/89 Gopathi Narayanaswami Chetty Road, T Nagar, Chennai, Tamil Nadu 600017","Asia/Kolkata","https://www.haworth.com/ap/en/spaces/showrooms/chennai.html","required","Haworth"],
  ["haworth-delhi","Haworth Delhi Showroom","IN","Gurugram","Haryana","Unit 001 Ground Floor, Time Tower, MG Road, Gurugram, Haryana 122002","Asia/Kolkata","https://www.haworth.com/ap/en/spaces/showrooms/delhi.html","required","Haworth"],
  ["haworth-hyderabad","Haworth Hyderabad Showroom","IN","Hyderabad","Telangana","Unit 704, Gowra Palladium, Silpa Gram Craft Village, HITEC City, Hyderabad, Telangana 500081","Asia/Kolkata","https://www.haworth.com/ap/en/spaces/showrooms/hyderabad.html","required","Haworth"],
  ["haworth-mumbai","Haworth Mumbai Showroom","IN","Mumbai","Maharashtra","1001-1002 Alpha Building, 10th Floor, Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076","Asia/Kolkata","https://www.haworth.com/ap/en/spaces/showrooms/mumbai.html","required","Haworth"],
  ["featherlite-bengaluru","Featherlite Bengaluru","IN","Bengaluru","Karnataka","16A Millers Road, Kaverappa Layout, Vasanth Nagar, Bengaluru, Karnataka 560052","Asia/Kolkata","https://v1.featherlitefurniture.com/contact/","unknown"],

  // Southeast Asia — brand and specialist showroom pages.
  ["flokk-singapore","Flokk Singapore at Omnidesk","SG","Singapore","","Funan Mall, 107 North Bridge Road, #03-K03, Singapore 179105","Asia/Singapore","https://flokk.asia/pages/our-showrooms","walk_in","Flokk"],
  ["okamura-singapore","Okamura Singapore Live Office","SG","Singapore","","1557 Keppel Road, #01-05, Singapore 089066","Asia/Singapore","https://www.okamura.com/showrooms/","required","Okamura"],
  ["kokuyo-singapore","Kokuyo Singapore Showroom","SG","Singapore","","31-33 Ann Siang Road, Singapore 069711","Asia/Singapore","https://www.kokuyo.com/en/about/group-companies/","required","Kokuyo"],
  ["merryfair-singapore","Merryfair Singapore","SG","Singapore","","33 Ubi Avenue 3, #03-19 Vertex, Singapore 408868","Asia/Singapore","https://www.merryfair.com/about-us/","unknown"],
  ["cnr-singapore","C&R Singapore Flagship Showroom","SG","Singapore","","100 Pasir Panjang Road, #01-01, Singapore 118518","Asia/Singapore","https://cnrinteriors.com.sg/wp-content/uploads/2025/10/AXEL-CHAIR_2025.pdf","walk_in"],
  ["chroma-singapore","Chroma Singapore Experience Center","SG","Singapore","","14 Arumugam Road, #01-01 LTC Building Tower C, Singapore 409959","Asia/Singapore","https://chromafurnishing.com/visit-us","walk_in"],
  ["humanscale-singapore","Humanscale Singapore Showroom","SG","Singapore","","15 Teo Hong Road, Singapore 088328","Asia/Singapore","https://latam.humanscale.com/about/company-overview/locations.cfm","required","Humanscale"],
  ["flokk-kuala-lumpur","Flokk Kuala Lumpur at Matic","MY","Kuala Lumpur","Kuala Lumpur","45E-2A Level 2, Bangunan Bangsaria, Jalan Maarof, Bangsar, 59000 Kuala Lumpur","Asia/Kuala_Lumpur","https://flokk.asia/pages/our-showrooms","required","Flokk"],
  ["okamura-kuala-lumpur","Okamura Kuala Lumpur","MY","Kuala Lumpur","Kuala Lumpur","Suite B-12A-5, Menara UOA Bangsar, 5 Jalan Bangsar Utama 1, 59000 Kuala Lumpur","Asia/Kuala_Lumpur","https://www.okamura.com/showrooms/","required","Okamura"],
  ["merryfair-kuala-lumpur","Merryfair Kuala Lumpur Showroom","MY","Kuala Lumpur","Kuala Lumpur","82-84 Jalan 2/23A, Jalan Genting Kelang, 53300 Kuala Lumpur","Asia/Kuala_Lumpur","https://www.merryfair.com/about-us/","unknown"],
  ["cnr-kuala-lumpur","C&R Kuala Lumpur Showroom","MY","Kuala Lumpur","Kuala Lumpur","10-10 Wisma UOA II, 21 Jalan Pinang, 50450 Kuala Lumpur","Asia/Kuala_Lumpur","https://cnrinteriors.com.sg/wp-content/uploads/2025/10/AXEL-CHAIR_2025.pdf","required"],
  ["chroma-kuala-lumpur","Chroma Kuala Lumpur Showroom","MY","Kuala Lumpur","Kuala Lumpur","Unit A-01-24 Plaza Bukit Jalil, 1 Persiaran Jalil 1, 57000 Kuala Lumpur","Asia/Kuala_Lumpur","https://chromafurnishing.com/visit-us","required"],
  ["chroma-johor-bahru","Chroma Johor Bahru Showroom","MY","Johor Bahru","Johor","27 Jalan Ekoperniagaan 2/7, Taman Ekoperniagaan, 81100 Johor Bahru, Johor","Asia/Kuala_Lumpur","https://chromafurnishing.com/visit-us","walk_in"],
  ["okamura-bangkok","Okamura Bangkok Showroom","TH","Bangkok","Bangkok","3199 Maleenont Tower 19th Floor, Rama IV Road, Khlong Toei, Bangkok 10110","Asia/Bangkok","https://www.okamura.com/showrooms/","required","Okamura"],
  ["merryfair-bangkok","Merryfair Bangkok Showroom","TH","Bangkok","Bangkok","19/1-2 Sithakarn, Soi Chidlom, Lumphini, Pathum Wan, Bangkok 10330","Asia/Bangkok","https://www.merryfair.com/about-us/","unknown"],
  ["cnr-bangkok","C&R Bangkok Showroom","TH","Bangkok","Bangkok","O-NES Tower, 19th Floor Unit 4, 6 Sukhumvit Soi 6, Khlong Toei, Bangkok 10110","Asia/Bangkok","https://cnrinteriors.com.sg/wp-content/uploads/2025/10/AXEL-CHAIR_2025.pdf","required"],
  ["kokuyo-bangkok","Kokuyo Bangkok","TH","Bangkok","Bangkok","One City Centre, 22nd Floor Units 2201-2202, 548 Ploenchit Road, Lumphini, Pathum Wan, Bangkok 10330","Asia/Bangkok","https://www.kokuyo.com/en/about/group-companies/","required","Kokuyo"],
  ["flokk-jakarta","Flokk Jakarta at Hallning","ID","Jakarta","Jakarta","Grha Estetica 1st Floor, Jalan Wolter Monginsidi 89, South Jakarta 12180","Asia/Jakarta","https://flokk.asia/pages/our-showrooms","walk_in","Flokk"],
  ["okamura-jakarta","Okamura Jakarta Showroom","ID","Jakarta","Jakarta","MidPlaza 2, 22nd Floor, Jalan Jenderal Sudirman Kav 10-11, Jakarta Pusat 10220","Asia/Jakarta","https://www.okamura.com/showrooms/","required","Okamura"],
  ["kokuyo-jakarta","Kokuyo Furniture Indonesia","ID","Jakarta","Jakarta","TOTO Building 10th Floor, Jalan Letjen S Parman Kav 81, Jakarta 11420","Asia/Jakarta","https://www.kokuyo.com/en/about/group-companies/","required","Kokuyo"],
  ["okamura-ho-chi-minh","Okamura Ho Chi Minh Showroom","VN","Ho Chi Minh City","","Suite 1104B, 11th Floor Saigon Tower, 29 Le Duan, Ho Chi Minh City","Asia/Ho_Chi_Minh","https://www.okamura.com/showrooms/","required","Okamura"],
  ["okamura-hanoi","Okamura Hanoi Showroom","VN","Hanoi","","19th Floor Capital Place, 29 Lieu Giai, Hanoi","Asia/Ho_Chi_Minh","https://www.okamura.com/showrooms/","required","Okamura"],
  ["ofina-hanoi","OFINA Hanoi Showroom","VN","Hanoi","","135 K2 Road, Phu Do Ward, Hanoi","Asia/Ho_Chi_Minh","https://ofina.vn/","walk_in"],
  ["ofina-ho-chi-minh","OFINA Ho Chi Minh Showroom","VN","Ho Chi Minh City","","2nd Floor, 36 Luong Dinh Cua, Thu Duc City, Ho Chi Minh City","Asia/Ho_Chi_Minh","https://ofina.vn/","walk_in"],
  ["exsto-manila","EXSTO Philippines Showroom","PH","Muntinlupa","Metro Manila","Unit B-52, 2nd Floor Westgate Center, Zapote-Alabang Road, Alabang, Muntinlupa 1781","Asia/Manila","https://exsto.com.sg/innovative-privacy-office-solutions/ergonomic-solution/","required"],
  ["umci-makati","The Space by UMCI","PH","Makati","Metro Manila","Ground Floor ENZO Building, The Wellington Centre, 399 Senator Gil Puyat Avenue, Makati 1200","Asia/Manila","https://umci.ph/","walk_in","Steelcase"],
  ["gentleprince-taguig","Gentleprince Taguig","PH","Taguig","Metro Manila","Unit 1116, 11th Floor Park Triangle Corporate Plaza North Tower, 32nd Street corner 11th Avenue, BGC, Taguig","Asia/Manila","https://store.gentleprince.com/","unknown"],
  ["group-perspective-taguig","Group Perspective Showroom","PH","Taguig","Metro Manila","Building 108, Panorama Compound Veterans Center, Western Bicutan, Taguig 1630","Asia/Manila","https://groupperspective.com.ph/","unknown"],
  ["accent-grand-showroom-makati","Accent Grand Showroom","PH","Makati","Metro Manila","Ground Floor The World Centre Building, Senator Gil Puyat Avenue, Makati 1209","Asia/Manila","https://www.accent.com.ph/","walk_in"],
  ["cwc-makati","CWC Design Center Makati","PH","Makati","Metro Manila","814 A. Arnaiz Street, San Lorenzo Village, Makati 1223","Asia/Manila","https://www.cwcinteriors.com.ph/","walk_in","Herman Miller"],
  ["cwc-cebu","CWC Interiors Cebu","PH","Cebu City","Cebu","Retail Units 9 and 10, Upper Ground Floor, Latitude Corporate Center, Mindanao Avenue, Cebu Business Park, Cebu City 6000","Asia/Manila","https://www.cwcinteriors.com.ph/","walk_in","Herman Miller"],
  ["cwc-davao","CWC Interiors Davao","PH","Davao City","Davao del Sur","Matina IT Park, McArthur Highway, Talomo, Davao City 8000","Asia/Manila","https://www.cwcinteriors.com.ph/","walk_in","Herman Miller"],
  ["stacked-furniture-san-juan","Stacked Furniture San Juan","PH","San Juan","Metro Manila","2nd Floor Unit 02, Metro Pointe Center, P. Guevarra Street corner N. Averilla Street, San Juan City 1500","Asia/Manila","https://stackedfurniture.com/pages/contact-us","walk_in"],
  ["greatyear-makati","Great Year Industries Makati","PH","Makati","Metro Manila","2nd Floor Cancio Building, 1047 Metropolitan Avenue, Makati 1203","Asia/Manila","https://www.greatyear.com.ph/","walk_in"],
  ["greatyear-imus","Great Year Industries Imus","PH","Imus","Cavite","225 Advincula Road, Imus, Cavite","Asia/Manila","https://www.greatyear.com.ph/","walk_in"],
];

const boxes = {
  MX: [-119, 14, -86, 33], NZ: [165, -48, 179, -33], IN: [68, 6, 98, 36],
  SG: [103.5, 1.1, 104.1, 1.6], MY: [99, 0, 120, 8], TH: [97, 5, 106, 21],
  ID: [94, -12, 142, 7], VN: [102, 8, 110, 24], PH: [116, 4, 127, 21],
};

async function main() {
  const outputPath = "content/showrooms/asia-pacific-mexico-wave.json";
  let output = [];
  try { output = JSON.parse(fs.readFileSync(outputPath, "utf8")); } catch {}
  const complete = new Set(output.map((item) => item.slug));
  const pending = candidates.filter((item) => !complete.has(item[0]));
  for (let start = 0; start < pending.length; start += 6) {
    const batch = await Promise.all(pending.slice(start, start + 6).map(async (item) => {
    const [slug,name,country,city,region,address,timezone,source,appointment,brand] = item;
    const url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine=" + encodeURIComponent(`${address}, ${country}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoder HTTP ${response.status} for ${slug}`);
    const json = await response.json();
    const candidate = json.candidates?.[0];
    const box = boxes[country];
    const valid = Boolean(candidate && candidate.score >= 75 && candidate.location.x >= box[0] && candidate.location.x <= box[2] && candidate.location.y >= box[1] && candidate.location.y <= box[3]);
    const result = { slug,name,country_code:country,city,region,address,timezone,source_url:source,appointment,brand:brand||"",score:candidate?.score||0,matched:candidate?.address||"",latitude:candidate?.location.y??null,longitude:candidate?.location.x??null,valid };
    process.stdout.write(valid ? "." : "X");
    return result;
    }));
    output.push(...batch);
    fs.writeFileSync(outputPath, JSON.stringify(output,null,2)+"\n");
  }
  output.sort((a,b) => candidates.findIndex((item)=>item[0]===a.slug)-candidates.findIndex((item)=>item[0]===b.slug));
  fs.writeFileSync(outputPath, JSON.stringify(output,null,2)+"\n");
  console.log(`\n${output.filter((item)=>item.valid).length}/${output.length} addresses passed.`);
}
main().catch((error)=>{ console.error(error); process.exit(1); });
