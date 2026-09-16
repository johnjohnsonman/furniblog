const fs = require("node:fs");

const candidates = [
  ["steelcase-hong-kong","Steelcase WorkLife Hong Kong","HK","Hong Kong","Central","15/F, Kinwick Centre, 32 Hollywood Road, Central, Hong Kong","Asia/Hong_Kong","https://shop.steelcase.com/pages/where-to-try","required","Steelcase"],
  ["herman-miller-hong-kong","Herman Miller Living Office Hong Kong","HK","Hong Kong","Wan Chai","Rooms 4707-13, 47/F, Hopewell Centre, 183 Queen's Road East, Wan Chai, Hong Kong","Asia/Hong_Kong","https://www.hermanmiller.com/en_apc/contact/","required","Herman Miller"],
  ["humanscale-hong-kong","Humanscale Hong Kong","HK","Hong Kong","Central","1304 Kinwick Centre, 32 Hollywood Road, Central, Hong Kong","Asia/Hong_Kong","https://mena.humanscale.com/about/company-overview/locations.cfm","required","Humanscale"],
  ["ifco-kwun-tong","IFCO Deco Kwun Tong","HK","Hong Kong","Kwun Tong","Shops 301-302, 3/F, Yen Sheng Centre, 64 Hoi Yuen Road, Kwun Tong, Hong Kong","Asia/Hong_Kong","https://ifco.com.hk/en/pages/showroom-address","walk_in",null],
  ["ifco-sha-tin","IFCO Deco Sha Tin","HK","Hong Kong","Sha Tin","Room 808, HomeSquare, 138 Sha Tin Rural Committee Road, Sha Tin, Hong Kong","Asia/Hong_Kong","https://ifco.com.hk/en/pages/showroom-address","walk_in",null],
  ["ekobor-causeway-bay","Ekobor Causeway Bay","HK","Hong Kong","Causeway Bay","Unit 03, 28/F, Sino Plaza, 255 Gloucester Road, Causeway Bay, Hong Kong","Asia/Hong_Kong","https://shop.steelcase.com/pages/where-to-try","walk_in","Steelcase"],
  ["ekobor-kowloon-bay","Ekobor Kowloon Bay","HK","Hong Kong","Kowloon Bay","Shop 428, Telford Plaza II, Kowloon Bay, Hong Kong","Asia/Hong_Kong","https://shop.steelcase.com/pages/where-to-try","walk_in","Steelcase"],
  ["ekobor-kai-tak","Ekobor Kai Tak","HK","Hong Kong","Kai Tak","8/F, SOGO Kai Tak Store, Kai Tak, Hong Kong","Asia/Hong_Kong","https://shop.steelcase.com/pages/where-to-try","walk_in","Steelcase"],
  ["sbfi-hong-kong","SBFI Hong Kong Showroom","HK","Hong Kong","Central","12/F, Wyndham Place, 40-44 Wyndham Street, Central, Hong Kong","Asia/Hong_Kong","https://www.sbfi.com/contact/","required",null],
  ["sincere-humanscale-taipei","Sincere Humanscale Taipei Showroom","TW","Taipei","Taipei City","Room 2, 12/F, No. 2, Section 3, Bade Road, Songshan District, Taipei City 105, Taiwan","Asia/Taipei","https://www.sinceretw.com/","required","Humanscale"],
  ["herman-miller-dubai","Herman Miller Regional Design Centre Dubai","AE","Dubai","Dubai","Office 2806, Marina Plaza, Dubai Marina, Dubai, United Arab Emirates","Asia/Dubai","https://www.hermanmiller.com/en_gb/contact/dubai-showroom/","walk_in","Herman Miller"],
  ["humanscale-dubai","Humanscale Dubai","AE","Dubai","Dubai","Office 602, Level 6, Building 3, Dubai Design District, Dubai, United Arab Emirates","Asia/Dubai","https://mena.humanscale.com/about/company-overview/locations.cfm","required","Humanscale"],
  ["sedus-dubai","Sedus Dubai Showroom","AE","Dubai","Dubai","Offices 2402-2404, Concord Tower, 11 Al Bourooj Street, Dubai, United Arab Emirates","Asia/Dubai","https://www.sedus.com/en/contact/showrooms/dubai","required",null],
  ["sbfi-dubai","SBFI Dubai Showroom","AE","Dubai","Dubai","109 Al Makhawi Building, Umm Hurair Road, Dubai, United Arab Emirates","Asia/Dubai","https://www.sbfi.com/contact/","required",null],
  ["sbfi-riyadh","SBFI Riyadh Showroom","SA","Riyadh","Riyadh","Riyadh 11432, Saudi Arabia","Asia/Riyadh","https://www.sbfi.com/contact/","required",null]
];
const boxes = { HK:[113.8,22.1,114.5,22.7], TW:[119.8,21.8,122.1,25.5], AE:[51,22,57,27], SA:[34,16,56,33] };

async function main() {
  const output = [];
  for (let start = 0; start < candidates.length; start += 5) {
    const batch = await Promise.all(candidates.slice(start, start + 5).map(async ([slug,name,country_code,city,region,address,timezone,source_url,appointment,brand]) => {
      const url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&maxLocations=1&SingleLine=" + encodeURIComponent(address);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Geocoder HTTP ${response.status} for ${slug}`);
      const candidate = (await response.json()).candidates?.[0];
      const box = boxes[country_code];
      const valid = Boolean(candidate && candidate.score >= 70 && candidate.location.x >= box[0] && candidate.location.x <= box[2] && candidate.location.y >= box[1] && candidate.location.y <= box[3]);
      return { slug,name,country_code,city,region,address,timezone,source_url,appointment,brand:brand||"",score:candidate?.score||0,matched:candidate?.address||"",latitude:candidate?.location.y??null,longitude:candidate?.location.x??null,valid };
    }));
    output.push(...batch);
  }
  fs.writeFileSync("content/showrooms/greater-china-gulf-wave.json", JSON.stringify(output,null,2)+"\n");
  console.log(`${output.filter(x=>x.valid).length}/${output.length} addresses passed.`);
  for (const x of output.filter(x=>!x.valid)) console.log("REVIEW", x.slug, x.score, x.matched);
}
main().catch(error => { console.error(error); process.exit(1); });
