const fs = require("node:fs");

const candidates = [
  // Canada: official showroom/location pages.
  ["otg-calgary","Offices to Go Calgary","CA","Calgary","AB","302-237 8 Avenue SE, Calgary, AB T2G 5C3","America/Edmonton","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-montreal","Offices to Go Montréal","CA","Montréal","QC","1010 Sainte-Catherine Street W, Montreal, QC H3B 1E7","America/Toronto","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-edmonton","Offices to Go Edmonton","CA","Edmonton","AB","201-10158 103 Street NW, Edmonton, AB T5J 0X6","America/Edmonton","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-ottawa","Offices to Go Ottawa","CA","Ottawa","ON","Unit 2, 73 Breezehill Ave N, Ottawa, ON K1Y 2H6","America/Toronto","https://www.officestogo.com/en-ca/showrooms","required"],
  ["otg-halifax","Offices to Go Halifax","CA","Halifax","NS","120-1061 Marginal Road, Halifax, NS B3H 4P7","America/Halifax","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-toronto","Offices to Go Toronto","CA","Toronto","ON","1350 Flint Road, Toronto, ON M3J 2J7","America/Toronto","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-vancouver","Offices to Go Vancouver","CA","Vancouver","BC","1000-675 West Hastings Street, Vancouver, BC V6B 1N2","America/Vancouver","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["otg-winnipeg","Offices to Go Winnipeg","CA","Winnipeg","MB","220-111 Lombard Avenue, Winnipeg, MB R3B 0T4","America/Winnipeg","https://www.officestogo.com/en-ca/showrooms","unknown"],
  ["coi-toronto","Contemporary Office Interiors Toronto","CA","Toronto","ON","56 Temperance Street, 2nd Floor, Toronto, ON M5H 3V5","America/Toronto","https://coi.ca/contact/","required"],
  ["coi-vancouver","Contemporary Office Interiors Vancouver","CA","Vancouver","BC","2231 Columbia Street, Vancouver, BC V5Y 0M6","America/Vancouver","https://coi.ca/contact/","required"],
  ["coi-winnipeg","Contemporary Office Interiors Winnipeg","CA","Winnipeg","MB","118 King Edward Street E, Winnipeg, MB R3H 0N8","America/Winnipeg","https://coi.ca/contact/","required"],
  ["coi-calgary","Contemporary Office Interiors Calgary","CA","Calgary","AB","2206 Portland Street SE, Calgary, AB T2G 4M6","America/Edmonton","https://coi.ca/contact/","required"],
  ["manhattan-montreal","Manhattan Montreal","CA","Montréal","QC","6150 Route Transcanadienne, Montreal, QC H4T 1X5","America/Toronto","https://www.manhattaninc.com/contact","unknown"],
  ["manhattan-toronto","Manhattan Toronto","CA","Toronto","ON","160 Tycos Drive, Suite B2, Toronto, ON M6B 1W8","America/Toronto","https://www.manhattaninc.com/contact","unknown"],
  ["manhattan-vancouver","Manhattan Vancouver","CA","Vancouver","BC","Unit 265, 1951 Glen Drive, Vancouver, BC V6A 4J6","America/Vancouver","https://www.manhattaninc.com/contact","unknown"],
  ["bureau-toronto","Bureau Toronto","CA","Toronto","ON","192 Spadina Avenue, Toronto, ON M5T 2C2","America/Toronto","https://withbureau.com/showrooms/","unknown"],
  ["bureau-montreal","Bureau Montréal","CA","Montréal","QC","413 Rue Saint-Jacques, 7th floor, Montreal, QC H2Y 1N9","America/Toronto","https://withbureau.com/showrooms/","unknown"],
  ["bureau-calgary","Bureau Calgary","CA","Calgary","AB","1550 5 Street SW, Calgary, AB T2R 1K3","America/Edmonton","https://withbureau.com/showrooms/","unknown"],
  ["bureau-halifax","Bureau Halifax","CA","Halifax","NS","Unit 801, 1800 Argyle Street, Halifax, NS B3J 3N8","America/Halifax","https://withbureau.com/showrooms/","unknown"],
  ["steelcase-toronto","Steelcase WorkLife Toronto","CA","Toronto","ON","Suite 2400, 200 King Street West, Toronto, ON M5H 3T4","America/Toronto","https://www.steelcase.com/find-us/locations/americas/toronto-ontario/","required","Steelcase"],
  ["branch-toronto","Branch Toronto","CA","Toronto","ON","385 Adelaide Street W, Toronto, ON","America/Toronto","https://www.branchfurniture.ca/pages/location/branch-toronto","required"],

  // Australia: chair specialists and public furniture showrooms.
  ["aussie-chair-sydney","Aussie Chair Sydney","AU","Sydney","NSW","Unit 11, 46-50 Wellington Road, South Granville NSW 2142","Australia/Sydney","https://aussiechair.com.au/pages/showrooms","required"],
  ["aussie-chair-melbourne","Aussie Chair Melbourne","AU","Melbourne","VIC","Unit 1A, 280 Whitehorse Road, Nunawading VIC 3131","Australia/Melbourne","https://aussiechair.com.au/pages/showrooms","required"],
  ["aussie-chair-adelaide","Aussie Chair Adelaide","AU","Adelaide","SA","Unit 2, 41 Wood Avenue, Brompton SA 5007","Australia/Adelaide","https://aussiechair.com.au/pages/showrooms","required"],
  ["aussie-chair-perth","Aussie Chair Perth","AU","Perth","WA","11-15 Fargo Way, Welshpool WA 6106","Australia/Perth","https://aussiechair.com.au/pages/showrooms","required"],
  ["aussie-chair-tasmania","Aussie Chair Tasmania","AU","Launceston","TAS","16 Lila Drive, Prospect TAS 7250","Australia/Hobart","https://aussiechair.com.au/pages/showrooms","required"],
  ["chairforce-sydney","Chairforce Sydney","AU","Sydney","NSW","Warehouse 1, 161 Manchester Road, Auburn NSW","Australia/Sydney","https://chairforce.com.au/","walk_in"],
  ["chairforce-brisbane","Chairforce Brisbane","AU","Brisbane","QLD","Unit 1A, 405 Newman Road, Geebung QLD","Australia/Brisbane","https://chairforce.com.au/","walk_in"],
  ["chairforce-adelaide","Chairforce Adelaide","AU","Adelaide","SA","Warehouse 1, 21-31 Sheffield Street, Woodville North SA","Australia/Adelaide","https://chairforce.com.au/","walk_in"],
  ["chairforce-melbourne","Chairforce Melbourne","AU","Melbourne","VIC","Warehouse 4, 95 South Gippsland Highway, Dandenong South VIC","Australia/Melbourne","https://chairforce.com.au/","walk_in"],
  ["chairforce-perth","Chairforce Perth","AU","Perth","WA","33 Cleaver Terrace, Rivervale WA","Australia/Perth","https://chairforce.com.au/","walk_in"],
  ["fast-office-sydney","Fast Office Furniture Sydney","AU","Sydney","NSW","Unit 7, 2 Southridge Street, Eastern Creek NSW 2766","Australia/Sydney","https://www.fastofficefurniture.com.au/office-furniture/office-chairs/","unknown"],
  ["fast-office-brisbane","Fast Office Furniture Brisbane","AU","Brisbane","QLD","133 Queen Street, Cleveland QLD 4163","Australia/Brisbane","https://www.fastofficefurniture.com.au/office-furniture/office-chairs/","unknown"],
  ["fast-office-perth","Fast Office Furniture Perth","AU","Perth","WA","39 Callaway Street, Wangara WA 6065","Australia/Perth","https://www.fastofficefurniture.com.au/office-furniture/office-chairs/","unknown"],
  ["fast-office-melbourne","Fast Office Furniture Melbourne","AU","Melbourne","VIC","Building 3B, 9-19 Leakes Road, Laverton North VIC 3026","Australia/Melbourne","https://www.fastofficefurniture.com.au/office-furniture/office-chairs/","unknown"],
  ["bfx-sydney","BFX Furniture Sydney","AU","Sydney","NSW","Unit 33, 10 Gladstone Road, Castle Hill NSW 2153","Australia/Sydney","https://www.bfx.com.au/location/","required"],
  ["bfx-melbourne","BFX Furniture Melbourne","AU","Melbourne","VIC","1 Richards Circuit, Keilor Park VIC 3042","Australia/Melbourne","https://www.bfx.com.au/location/","required"],

  // China: published experience centres, showrooms and ergonomic-chair stores.
  ["matsu-shanghai","MATSU Shanghai Experience Centre","CN","Shanghai","","686 Zhaojiabang Road, Xuhui District, Shanghai 200030","Asia/Shanghai","https://matsu.cn/eweb/orderLook","required"],
  ["matsu-beijing","MATSU Beijing Experience Centre","CN","Beijing","","B1202, SOHO2, 9 Guanghua Road, Chaoyang District, Beijing 100020","Asia/Shanghai","https://matsu.cn/eweb/orderLook","required"],
  ["matsu-hangzhou","MATSU Hangzhou Experience Centre","CN","Hangzhou","Zhejiang","3001/3008 Hangzhou City North MixC, Liangzhu Street, Yuhang District, Hangzhou","Asia/Shanghai","https://matsu.cn/eweb/orderLook","required"],
  ["matsu-shenzhen","MATSU Shenzhen Experience Centre","CN","Shenzhen","Guangdong","9F West Building, Cafu Plaza, 5 Guihua Road, Futian Free Trade Zone, Shenzhen","Asia/Shanghai","https://matsu.cn/eweb/orderLook","required"],
  ["lamex-shanghai","Lamex Shanghai Showroom","CN","Shanghai","","5F Tower 3, Raffles City Changning, 1193 Changning Road, Shanghai 200051","Asia/Shanghai","https://www.lamex.com/sites/default/files/2020-05/Task_Chairs_Brochure_EC_%282019_06%29.pdf","unknown"],
  ["lamex-beijing","Lamex Beijing Showroom","CN","Beijing","","12F No.1 Easton Centre, 18 Guangqu Road, Chaoyang District, Beijing 100022","Asia/Shanghai","https://www.lamex.com/sites/default/files/2020-05/Task_Chairs_Brochure_EC_%282019_06%29.pdf","unknown"],
  ["lamex-guangzhou","Lamex Guangzhou Showroom","CN","Guangzhou","Guangdong","Unit 2, 22F Jun Lin Building, 285 Linhe East Road, Tianhe District, Guangzhou 510610","Asia/Shanghai","https://www.lamex.com/sites/default/files/2020-05/Task_Chairs_Brochure_EC_%282019_06%29.pdf","unknown"],
  ["lamex-shenzhen","Lamex Shenzhen Showroom","CN","Shenzhen","Guangdong","Unit 2009 Huarong Building, 2003 Shennan Avenue, Futian District, Shenzhen 518000","Asia/Shanghai","https://www.lamex.com/sites/default/files/2020-05/Task_Chairs_Brochure_EC_%282019_06%29.pdf","unknown"],
  ["aurora-pudong-shanghai","Aurora Furniture Pudong Showroom","CN","Shanghai","","10F Aurora International Building, 99 Fucheng Road, Pudong, Shanghai","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["aurora-jiading-shanghai","Aurora Furniture Jiading Showroom","CN","Shanghai","","369 Shenxia Road, Jiading District, Shanghai","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["aurora-beijing","Aurora Furniture Beijing Showroom","CN","Beijing","","Room 502 Tower 1, Guanghua Changan Building, 7 Jianguomen Inner Street, Beijing","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["aurora-qingdao","Aurora Furniture Qingdao Showroom","CN","Qingdao","Shandong","Room 302 Tower B, Fenghe Plaza, 12 Hong Kong Middle Road, Qingdao","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["aurora-guangzhou","Aurora Furniture Guangzhou Showroom","CN","Guangzhou","Guangdong","10F Tower E, Jianhe Center, 111 Tiyu West Road, Tianhe District, Guangzhou","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["aurora-nanjing","Aurora Furniture Nanjing Showroom","CN","Nanjing","Jiangsu","Room 1611 Longsheng Building, 23 Hongwu Road, Nanjing","Asia/Shanghai","https://www.auroraof.com/contact/","required"],
  ["heibaidiao-raffles-shanghai","HBADA Raffles City Shanghai","CN","Shanghai","","L4-20 Raffles City, 268 Xizang Middle Road, Huangpu District, Shanghai","Asia/Shanghai","https://www.heibaidiao.com/OfflineStore","walk_in"],
  ["heibaidiao-ruihong-shanghai","HBADA Ruihong Tiandi Shanghai","CN","Shanghai","","Room 356, 3F Ruihong Tiandi Sun Palace, 181 Ruihong Road, Hongkou District, Shanghai","Asia/Shanghai","https://www.heibaidiao.com/OfflineStore","walk_in"],
  ["heibaidiao-nanxiang-shanghai","HBADA Nanxiang Incity Shanghai","CN","Shanghai","","L4 04-57B Nanxiang Incity, 2299 Chenxiang Road, Jiading District, Shanghai","Asia/Shanghai","https://www.heibaidiao.com/OfflineStore","walk_in"],
  ["heibaidiao-xixi-hangzhou","HBADA Xixi Incity Hangzhou","CN","Hangzhou","Zhejiang","01-88 Xixi Incity, 1 Wuchang Avenue, Yuhang District, Hangzhou","Asia/Shanghai","https://www.heibaidiao.com/OfflineStore","walk_in"],
  ["changjiang-shanghai","Changjiang Furniture Shanghai Experience Hall","CN","Shanghai","","61 Chengshan Road, Pudong New Area, Shanghai","Asia/Shanghai","https://www.cjf.hk/en/about-267.html","unknown"],
  ["changjiang-beijing","Changjiang Furniture Beijing","CN","Beijing","","17C Block A, Building 1, 48 North Third Ring West Road, Haidian District, Beijing","Asia/Shanghai","https://www.cjf.hk/en/about-267.html","unknown"],
  ["changjiang-guangzhou","Changjiang Furniture Guangzhou","CN","Guangzhou","Guangdong","Room 1005 Yi'an Plaza, 33 Jianshe Liuma Road, Yuexiu District, Guangzhou","Asia/Shanghai","https://www.cjf.hk/en/about-267.html","unknown"],
  ["changjiang-shenzhen","Changjiang Furniture Shenzhen","CN","Shenzhen","Guangdong","5F Block A, Nanzhenye Building, Baoan District, Shenzhen","Asia/Shanghai","https://www.cjf.hk/en/about-267.html","unknown"],

  // South America wave 2.
  ["herman-miller-brazil","Herman Miller Brazil","BR","São Paulo","SP","Rua João Lourenço 35, Vila Nova Conceição, São Paulo SP 04508-030","America/Sao_Paulo","https://www.hermanmiller.com/en_lac/contact/","unknown","Herman Miller"],
  ["megaflex-curitiba","Megaflex Curitiba","BR","Curitiba","PR","Travessa José Santana 34, Novo Mundo, Curitiba PR","America/Sao_Paulo","https://megaflex.net.br/contato","unknown"],
  ["metromoveis-curitiba","MetrôMóveis Curitiba","BR","Curitiba","PR","Rua Carlos de Laet 4845, Hauer, Curitiba PR 81730-030","America/Sao_Paulo","https://metromoveis.com.br/","unknown"],
  ["casa-do-escritorio-curitiba","Casa do Escritório Hauer","BR","Curitiba","PR","Rua Frei Henrique de Coimbra 390, Hauer, Curitiba PR","America/Sao_Paulo","https://casadoescritorio.net/","unknown"],
  ["strada-montevideo","Strada Montevideo","UY","Montevideo","","Constituyente 1957, Montevideo","America/Montevideo","https://strada.com.uy/","walk_in"],
  ["american-mesh-montevideo","American Mesh Montevideo","UY","Montevideo","","Demóstenes 3800, Montevideo","America/Montevideo","https://americanmesh.com.uy/","required"],
  ["american-mesh-punta-del-este","American Mesh Punta del Este","UY","Punta del Este","Maldonado","Galería Apolo, Avenida Gorlero and Calle 29, Punta del Este","America/Montevideo","https://americanmesh.com.uy/","required"],
  ["dynamobel-montevideo","Dynamobel Montevideo","UY","Montevideo","","World Trade Center Tower 3, Office 267, Montevideo 11300","America/Montevideo","https://www.dynamobel.com/empresa/showrooms/showroom-uruguay/","unknown"],
  ["ufficio-montevideo","Ufficio Montevideo","UY","Montevideo","","Constituyente 2023, Montevideo","America/Montevideo","https://www.ufficio.com.uy/","unknown"],
  ["hm-office-montevideo","HM Office Montevideo","UY","Montevideo","","Canelones 1995, Montevideo 11200","America/Montevideo","https://www.hm.com.uy/","unknown"],
  ["sillas-ec-quito","Sillas EC Quito","EC","Quito","","Av. América N31-182 and Av. Mariana de Jesús, Quito 170129","America/Guayaquil","https://sillas.ec/contacto/","walk_in"],
  ["ergoline-quito","ERGOline Quito","EC","Quito","","Av. Gaspar de Villarroel E9-35 and Av. de los Shyris, Quito","America/Guayaquil","https://www.ergolinecuador.com/","walk_in"],
  ["sp-showroom-quito","SP Showroom Quito","EC","Quito","","Orellana E9-168 and Av. 6 de Diciembre, Quito","America/Guayaquil","https://irp.cdn-website.com/0a2e3b19/files/uploaded/CAT%C3%81LOGO_SILLONER%C3%8DA_ERGON%C3%93MICA_18_DE_NOVIEMBRE_2024_SP.pdf","unknown"],
  ["sp-showroom-guayaquil","SP Showroom Guayaquil","EC","Guayaquil","","Víctor Emilio Estrada 1115 and Laureles, Guayaquil","America/Guayaquil","https://irp.cdn-website.com/0a2e3b19/files/uploaded/CAT%C3%81LOGO_SILLONER%C3%8DA_ERGON%C3%93MICA_18_DE_NOVIEMBRE_2024_SP.pdf","unknown"],
];

const boxes = { CA:[-142,41,-52,84], AU:[112,-44,154,-10], CN:[73,18,135,54], BR:[-75,-34,-32,6], UY:[-59,-36,-52,-29], EC:[-82,-6,-75,2] };
// ArcGIS often returns a 75-84 score for verified Chinese and Latin-American
// street addresses even when the matched district/city and coordinates are
// correct. These three candidates resolved to a different city/country and
// are deliberately excluded instead of accepting a country-only match.
const rejectedSlugs = new Set(["matsu-beijing", "lamex-beijing", "aurora-beijing"]);
async function main() {
  const output = [];
  for (const item of candidates) {
    const [slug,name,country,city,region,address,timezone,source,appointment,brand] = item;
    const url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine=" + encodeURIComponent(address + ", " + country);
    const json = await fetch(url).then(r => r.json());
    const candidate = json.candidates?.[0];
    const box = boxes[country];
    const valid = candidate && candidate.score >= 75 && !rejectedSlugs.has(slug) && candidate.location.x >= box[0] && candidate.location.x <= box[2] && candidate.location.y >= box[1] && candidate.location.y <= box[3];
    output.push({ slug,name,country_code:country,city,region,address,timezone,source_url:source,appointment,brand:brand||"", score:candidate?.score||0, matched:candidate?.address||"", latitude:candidate?.location.y??null, longitude:candidate?.location.x??null, valid:!!valid });
    process.stdout.write(valid ? "." : "X");
  }
  fs.writeFileSync("content/showrooms/global-expansion-wave.json", JSON.stringify(output,null,2)+"\n");
  console.log(`\n${output.filter(x=>x.valid).length}/${output.length} addresses passed.`);
}
main().catch(error => { console.error(error); process.exit(1); });
