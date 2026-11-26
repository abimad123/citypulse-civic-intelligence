import { State, City } from 'country-state-city';

export interface IndianState {
  isoCode: string;
  name: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface IndianDistrict {
  name: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface PincodeLookupResult {
  stateName: string;
  stateIsoCode?: string;
  district: string;
  block?: string;
  taluk?: string;
  postOffices: string[];
  division?: string;
  region?: string;
}

export interface ReverseGeocodeResult {
  state?: string;
  stateIsoCode?: string;
  district?: string;
  city?: string;
  ward?: string;
  pincode?: string;
}

// Curated official administrative districts for all 28 States and 8 Union Territories
// Ensures comprehensive, authoritative coverage even for newly formed districts
const CURATED_DISTRICTS: Record<string, string[]> = {
  AN: ['Nicobars', 'North and Middle Andaman', 'South Andaman'],
  AP: [
    'Alluri Sitharama Raju',
    'Anakapalli',
    'Ananthapuramu',
    'Annamayya',
    'Bapatla',
    'Chittoor',
    'Dr. B.R. Ambedkar Konaseema',
    'East Godavari',
    'Eluru',
    'Guntur',
    'Kakinada',
    'Krishna',
    'Kurnool',
    'Nandyal',
    'NTR',
    'Palnadu',
    'Parvathipuram Manyam',
    'Prakasam',
    'Srikakulam',
    'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai',
    'Tirupati',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari',
    'YSR Kadapa',
  ],
  AR: [
    'Anjaw',
    'Changlang',
    'Dibang Valley',
    'East Kameng',
    'East Siang',
    'Kamle',
    'Kra Daadi',
    'Kurung Kumey',
    'Lepa Rada',
    'Lohit',
    'Longding',
    'Lower Dibang Valley',
    'Lower Siang',
    'Lower Subansiri',
    'Namsai',
    'Pakke Kessang',
    'Papum Pare',
    'Shi Yomi',
    'Siang',
    'Tawang',
    'Tirap',
    'Upper Siang',
    'Upper Subansiri',
    'West Kameng',
    'West Siang',
  ],
  AS: [
    'Baksa',
    'Barpeta',
    'Biswanath',
    'Bongaigaon',
    'Cachar',
    'Charaideo',
    'Chirang',
    'Darrang',
    'Dhemaji',
    'Dhubri',
    'Dibrugarh',
    'Dima Hasao',
    'Goalpara',
    'Golaghat',
    'Hailakandi',
    'Hojai',
    'Jorhat',
    'Kamrup',
    'Kamrup Metropolitan',
    'Karbi Anglong',
    'Karimganj',
    'Kokrajhar',
    'Lakhimpur',
    'Majuli',
    'Morigaon',
    'Nagaon',
    'Nalbari',
    'Sivasagar',
    'Sonitpur',
    'South Salmara-Mankachar',
    'Tamulpur',
    'Tinsukia',
    'Udalguri',
    'West Karbi Anglong',
  ],
  BR: [
    'Araria',
    'Arwal',
    'Aurangabad',
    'Banka',
    'Begusarai',
    'Bhagalpur',
    'Bhojpur',
    'Buxar',
    'Darbhanga',
    'East Champaran',
    'Gaya',
    'Gopalganj',
    'Jamui',
    'Jehanabad',
    'Kaimur',
    'Katihar',
    'Khagaria',
    'Kishanganj',
    'Lakhisarai',
    'Madhepura',
    'Madhubani',
    'Munger',
    'Muzaffarpur',
    'Nalanda',
    'Nawada',
    'Patna',
    'Purnia',
    'Rohtas',
    'Saharsa',
    'Samastipur',
    'Saran',
    'Sheikhpura',
    'Sheohar',
    'Sitamarhi',
    'Siwan',
    'Supaul',
    'Vaishali',
    'West Champaran',
  ],
  CH: ['Chandigarh'],
  CT: [
    'Balod',
    'Baloda Bazar',
    'Balrampur',
    'Bastar',
    'Bemetara',
    'Bijapur',
    'Bilaspur',
    'Dantewada',
    'Dhamtari',
    'Durg',
    'Gariaband',
    'Gaurela-Pendra-Marwahi',
    'Janjgir-Champa',
    'Jashpur',
    'Kabirdham',
    'Kanker',
    'Khairagarh-Chhuikhadan-Gandai',
    'Kondagaon',
    'Korba',
    'Koriya',
    'Mahasamund',
    'Manendragarh-Chirmiri-Bharatpur',
    'Mohla-Manpur-Ambagarh Chowki',
    'Mungeli',
    'Narayanpur',
    'Raigarh',
    'Raipur',
    'Rajnandgaon',
    'Sakti',
    'Sarangarh-Bilaigarh',
    'Sukma',
    'Surajpur',
    'Surguja',
  ],
  DH: ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  DL: [
    'Central Delhi',
    'East Delhi',
    'New Delhi',
    'North Delhi',
    'North East Delhi',
    'North West Delhi',
    'Shahdara',
    'South Delhi',
    'South East Delhi',
    'South West Delhi',
    'West Delhi',
  ],
  GA: ['North Goa', 'South Goa'],
  GJ: [
    'Ahmedabad',
    'Amreli',
    'Anand',
    'Aravalli',
    'Banaskantha',
    'Bharuch',
    'Bhavnagar',
    'Botad',
    'Chhota Udaipur',
    'Dahod',
    'Dang',
    'Devbhoomi Dwarka',
    'Gandhinagar',
    'Gir Somnath',
    'Jamnagar',
    'Junagadh',
    'Kheda',
    'Kutch',
    'Mahisagar',
    'Mehsana',
    'Morbi',
    'Narmada',
    'Navsari',
    'Panchmahal',
    'Patan',
    'Porbandar',
    'Rajkot',
    'Sabarkantha',
    'Surat',
    'Surendranagar',
    'Tapi',
    'Vadodara',
    'Valsad',
  ],
  HR: [
    'Ambala',
    'Bhiwani',
    'Charkhi Dadri',
    'Faridabad',
    'Fatehabad',
    'Gurugram',
    'Hisar',
    'Jhajjar',
    'Jind',
    'Kaithal',
    'Karnal',
    'Kurukshetra',
    'Mahendragarh',
    'Nuh',
    'Palwal',
    'Panchkula',
    'Panipat',
    'Rewari',
    'Rohtak',
    'Sirsa',
    'Sonipat',
    'Yamunanagar',
  ],
  HP: [
    'Bilaspur',
    'Chamba',
    'Hamirpur',
    'Kangra',
    'Kinnaur',
    'Kullu',
    'Lahaul and Spiti',
    'Mandi',
    'Shimla',
    'Sirmaur',
    'Solan',
    'Una',
  ],
  JK: [
    'Anantnag',
    'Bandipora',
    'Baramulla',
    'Budgam',
    'Doda',
    'Ganderbal',
    'Jammu',
    'Kathua',
    'Kishtwar',
    'Kulgam',
    'Kupwara',
    'Poonch',
    'Pulwama',
    'Rajouri',
    'Ramban',
    'Reasi',
    'Samba',
    'Shopian',
    'Srinagar',
    'Udhampur',
  ],
  JH: [
    'Bokaro',
    'Chatra',
    'Deoghar',
    'Dhanbad',
    'Dumka',
    'East Singhbhum',
    'Garhwa',
    'Giridih',
    'Godda',
    'Gumla',
    'Hazaribagh',
    'Jamtara',
    'Khunti',
    'Koderma',
    'Latehar',
    'Lohardaga',
    'Pakur',
    'Palamu',
    'Ramgarh',
    'Ranchi',
    'Sahibganj',
    'Seraikela Kharsawan',
    'Simdega',
    'West Singhbhum',
  ],
  KA: [
    'Bagalkot',
    'Ballari',
    'Belagavi',
    'Bengaluru Rural',
    'Bengaluru Urban',
    'Bidar',
    'Chamarajanagar',
    'Chikkaballapur',
    'Chikkamagaluru',
    'Chitradurga',
    'Dakshina Kannada',
    'Davanagere',
    'Dharwad',
    'Gadag',
    'Hassan',
    'Haveri',
    'Kalaburagi',
    'Kodagu',
    'Kolar',
    'Koppal',
    'Mandya',
    'Mysuru',
    'Raichur',
    'Ramanagara',
    'Shivamogga',
    'Tumakuru',
    'Udupi',
    'Uttara Kannada',
    'Vijayanagara',
    'Vijayapura',
    'Yadgir',
  ],
  KL: [
    'Alappuzha',
    'Ernakulam',
    'Idukki',
    'Kannur',
    'Kasaragod',
    'Kollam',
    'Kottayam',
    'Kozhikode',
    'Malappuram',
    'Palakkad',
    'Pathanamthitta',
    'Thiruvananthapuram',
    'Thrissur',
    'Wayanad',
  ],
  LA: ['Kargil', 'Leh'],
  LD: ['Lakshadweep'],
  MP: [
    'Agar Malwa',
    'Alirajpur',
    'Anuppur',
    'Ashoknagar',
    'Balaghat',
    'Barwani',
    'Betul',
    'Bhind',
    'Bhopal',
    'Burhanpur',
    'Chhatarpur',
    'Chhindwara',
    'Damoh',
    'Datia',
    'Dewas',
    'Dhar',
    'Dindori',
    'Guna',
    'Gwalior',
    'Harda',
    'Hoshangabad / Narmadapuram',
    'Indore',
    'Jabalpur',
    'Jhabua',
    'Katni',
    'Khandwa',
    'Khargone',
    'Mandla',
    'Mandsaur',
    'Mauganj',
    'Morena',
    'Maihar',
    'Narsinghpur',
    'Neemuch',
    'Niwari',
    'Pandhurna',
    'Panna',
    'Raisen',
    'Rajgarh',
    'Ratlam',
    'Rewa',
    'Sagar',
    'Satna',
    'Sehore',
    'Seoni',
    'Shahdol',
    'Shajapur',
    'Sheopur',
    'Shivpuri',
    'Sidhi',
    'Singrauli',
    'Tikamgarh',
    'Ujjain',
    'Umaria',
    'Vidisha',
  ],
  MH: [
    'Ahilyanagar (Ahmednagar)',
    'Akola',
    'Amravati',
    'Beed',
    'Bhandara',
    'Buldhana',
    'Chandrapur',
    'Chhatrapati Sambhajinagar (Aurangabad)',
    'Dharashiv (Osmanabad)',
    'Dhule',
    'Gadchiroli',
    'Gondia',
    'Hingoli',
    'Jalgaon',
    'Jalna',
    'Kolhapur',
    'Latur',
    'Mumbai City',
    'Mumbai Suburban',
    'Nagpur',
    'Nanded',
    'Nandurbar',
    'Nashik',
    'Palghar',
    'Parbhani',
    'Pune',
    'Raigad',
    'Ratnagiri',
    'Sangli',
    'Satara',
    'Sindhudurg',
    'Solapur',
    'Thane',
    'Wardha',
    'Washim',
    'Yavatmal',
  ],
  MN: [
    'Bishnupur',
    'Chandel',
    'Churachandpur',
    'Imphal East',
    'Imphal West',
    'Jiribam',
    'Kakching',
    'Kamjong',
    'Kangpokpi',
    'Noney',
    'Pherzawl',
    'Senapati',
    'Tamenglong',
    'Tengnoupal',
    'Thoubal',
    'Ukhrul',
  ],
  ML: [
    'East Garo Hills',
    'East Jaintia Hills',
    'East Khasi Hills',
    'Eastern West Khasi Hills',
    'North Garo Hills',
    'Ri Bhoi',
    'South Garo Hills',
    'South West Garo Hills',
    'South West Khasi Hills',
    'West Garo Hills',
    'West Jaintia Hills',
    'West Khasi Hills',
  ],
  MZ: [
    'Aizawl',
    'Champhai',
    'Hnahthial',
    'Khawzawl',
    'Kolasib',
    'Lawngtlai',
    'Lunglei',
    'Mamit',
    'Saiha',
    'Saitual',
    'Serchhip',
  ],
  NL: [
    'Chümoukedima',
    'Dimapur',
    'Kiphire',
    'Kohima',
    'Longleng',
    'Mokokchung',
    'Mon',
    'Niuland',
    'Noklak',
    'Peren',
    'Phek',
    'Shamator',
    'Tseminyü',
    'Tuensang',
    'Wokha',
    'Zünheboto',
  ],
  OR: [
    'Angul',
    'Balangir',
    'Balasore',
    'Bargarh',
    'Bhadrak',
    'Boudh',
    'Cuttack',
    'Deogarh',
    'Dhenkanal',
    'Gajapati',
    'Ganjam',
    'Jagatsinghpur',
    'Jajpur',
    'Jharsuguda',
    'Kalahandi',
    'Kandhamal',
    'Kendrapara',
    'Kendujhar',
    'Khordha',
    'Koraput',
    'Malkangiri',
    'Mayurbhanj',
    'Nabarangpur',
    'Nayagarh',
    'Nuapada',
    'Puri',
    'Rayagada',
    'Sambalpur',
    'Subarnapur',
    'Sundargarh',
  ],
  PY: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
  PB: [
    'Amritsar',
    'Barnala',
    'Bathinda',
    'Faridkot',
    'Fatehgarh Sahib',
    'Fazilka',
    'Firozpur',
    'Gurdaspur',
    'Hoshiarpur',
    'Jalandhar',
    'Kapurthala',
    'Ludhiana',
    'Malerkotla',
    'Mansa',
    'Moga',
    'Mohali (SAS Nagar)',
    'Muktsar',
    'Pathankot',
    'Patiala',
    'Rupnagar',
    'Sangrur',
    'Shaheed Bhagat Singh Nagar (Nawanshahr)',
    'Tarn Taran',
  ],
  RJ: [
    'Ajmer',
    'Alwar',
    'Anupgarh',
    'Balotra',
    'Banswara',
    'Baran',
    'Barmer',
    'Beawar',
    'Bharatpur',
    'Bhilwara',
    'Bikaner',
    'Bundi',
    'Chittorgarh',
    'Churu',
    'Dausa',
    'Deeg',
    'Dholpur',
    'Didwana-Kuchaman',
    'Dudu',
    'Dungarpur',
    'Ganganagar',
    'Gangapur City',
    'Hanumangarh',
    'Jaipur',
    'Jaipur Rural',
    'Jaisalmer',
    'Jalore',
    'Jhalawar',
    'Jhunjhunu',
    'Jodhpur',
    'Jodhpur Rural',
    'Karauli',
    'Kekri',
    'Khairthal-Tijara',
    'Kota',
    'Kotputli-Behror',
    'Nagaur',
    'Neem Ka Thana',
    'Pali',
    'Phalodi',
    'Pratapgarh',
    'Rajsamand',
    'Salumbar',
    'Sanchore',
    'Sawai Madhopur',
    'Shahpura',
    'Sikar',
    'Sirohi',
    'Tonk',
    'Udaipur',
  ],
  SK: ['Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'],
  TN: [
    'Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivaganga',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',
  ],
  TG: [
    'Adilabad',
    'Bhadradri Kothagudem',
    'Hanumakonda',
    'Hyderabad',
    'Jagtial',
    'Jangaon',
    'Jayashankar Bhupalpally',
    'Jogulamba Gadwal',
    'Kamareddy',
    'Karimnagar',
    'Khammam',
    'Kumuram Bheem Asifabad',
    'Mahabubabad',
    'Mahabubnagar',
    'Mancherial',
    'Medak',
    'Medchal-Malkajgiri',
    'Mulugu',
    'Nagarkurnool',
    'Nalgonda',
    'Narayanpet',
    'Nirmal',
    'Nizamabad',
    'Peddapalli',
    'Rajanna Sircilla',
    'Ranga Reddy',
    'Sangareddy',
    'Siddipet',
    'Suryapet',
    'Vikarabad',
    'Wanaparthy',
    'Warangal',
    'Yadadri Bhuvanagiri',
  ],
  TR: [
    'Dhalai',
    'Gomati',
    'Khowai',
    'North Tripura',
    'Sepahijala',
    'South Tripura',
    'Unakoti',
    'West Tripura',
  ],
  UP: [
    'Agra',
    'Aligarh',
    'Ambedkar Nagar',
    'Amethi',
    'Amroha',
    'Auraiya',
    'Ayodhya',
    'Azamgarh',
    'Baghpat',
    'Bahraich',
    'Ballia',
    'Balrampur',
    'Banda',
    'Barabanki',
    'Bareilly',
    'Basti',
    'Bhadohi',
    'Bijnor',
    'Budaun',
    'Bulandshahr',
    'Chandauli',
    'Chitrakoot',
    'Deoria',
    'Etah',
    'Etawah',
    'Farrukhabad',
    'Fatehpur',
    'Firozabad',
    'Gautam Buddha Nagar (Noida)',
    'Ghaziabad',
    'Ghazipur',
    'Gonda',
    'Gorakhpur',
    'Hamirpur',
    'Hapur',
    'Hardoi',
    'Hathras',
    'Jalaun',
    'Jaunpur',
    'Jhansi',
    'Kannauj',
    'Kanpur Dehat',
    'Kanpur Nagar',
    'Kasganj',
    'Kaushambi',
    'Kheri',
    'Kushinagar',
    'Lalitpur',
    'Lucknow',
    'Maharajganj',
    'Mahoba',
    'Mainpuri',
    'Mathura',
    'Mau',
    'Meerut',
    'Mirzapur',
    'Moradabad',
    'Muzaffarnagar',
    'Pilibhit',
    'Pratapgarh',
    'Prayagraj (Allahabad)',
    'Raebareli',
    'Rampur',
    'Saharanpur',
    'Sambhal',
    'Sant Kabir Nagar',
    'Shahjahanpur',
    'Shamli',
    'Shravasti',
    'Siddharthnagar',
    'Sitapur',
    'Sonbhadra',
    'Sultanpur',
    'Unnao',
    'Varanasi',
  ],
  UT: [
    'Almora',
    'Bageshwar',
    'Chamoli',
    'Champawat',
    'Dehradun',
    'Haridwar',
    'Nainital',
    'Pauri Garhwal',
    'Pithoragarh',
    'Rudraprayag',
    'Tehri Garhwal',
    'Udham Singh Nagar',
    'Uttarkashi',
  ],
  WB: [
    'Alipurduar',
    'Bankura',
    'Birbhum',
    'Cooch Behar',
    'Dakshin Dinajpur',
    'Darjeeling',
    'Hooghly',
    'Howrah',
    'Jalpaiguri',
    'Jhargram',
    'Kalimpong',
    'Kolkata',
    'Malda',
    'Murshidabad',
    'Nadia',
    'North 24 Parganas',
    'Paschim Bardhaman',
    'Paschim Medinipur',
    'Purba Bardhaman',
    'Purba Medinipur',
    'Purulia',
    'South 24 Parganas',
    'Uttar Dinajpur',
  ],
};

/**
 * Returns all 28 States and 8 Union Territories of India sorted alphabetically.
 */
export function getIndianStates(): IndianState[] {
  const states = State.getStatesOfCountry('IN') || [];
  return states
    .map((s) => ({
      isoCode: s.isoCode,
      name: s.name,
      latitude: s.latitude,
      longitude: s.longitude,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Finds an Indian state by its 2-letter ISO code or full name (case-insensitive).
 */
export function findStateByCodeOrName(identifier?: string): IndianState | null {
  if (!identifier) return null;
  const states = getIndianStates();
  const clean = identifier.trim().toLowerCase();

  // Try matching ISO code first
  const byCode = states.find((s) => s.isoCode.toLowerCase() === clean);
  if (byCode) return byCode;

  // Try exact or partial name match
  const byName = states.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      s.name.toLowerCase().includes(clean) ||
      clean.includes(s.name.toLowerCase())
  );
  return byName || null;
}

/**
 * Returns all districts and major urban centers for a given Indian State / UT.
 * Merges official administrative districts with cities from country-state-city.
 */
export function getDistrictsAndCitiesByState(stateIsoCode: string): IndianDistrict[] {
  const code = stateIsoCode?.toUpperCase()?.trim();
  const curated = CURATED_DISTRICTS[code] || [];

  // Get cities from country-state-city library
  const libCities = City.getCitiesOfState('IN', code) || [];
  const cityMap = new Map<string, IndianDistrict>();

  // First seed with curated official districts
  for (const dist of curated) {
    cityMap.set(dist.toLowerCase(), {
      name: dist,
    });
  }

  // Then blend with library cities/towns
  for (const c of libCities) {
    const key = c.name.toLowerCase();
    if (!cityMap.has(key)) {
      cityMap.set(key, {
        name: c.name,
        latitude: c.latitude,
        longitude: c.longitude,
      });
    } else {
      const existing = cityMap.get(key)!;
      if (!existing.latitude && c.latitude) {
        existing.latitude = c.latitude;
        existing.longitude = c.longitude;
      }
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// List of prominent Indian cities with Municipal Corporations (Nagar Nigam)
const MAJOR_MUNICIPAL_CORPORATIONS = new Set([
  'ludhiana',
  'kollam',
  'thiruvananthapuram',
  'kochi',
  'cochin',
  'kozhikode',
  'calicut',
  'thrissur',
  'kannur',
  'delhi',
  'new delhi',
  'mumbai',
  'pune',
  'nagpur',
  'nashik',
  'thane',
  'navi mumbai',
  'aurangabad',
  'chhatrapati sambhajinagar',
  'solapur',
  'bengaluru',
  'bangalore',
  'mysuru',
  'mysore',
  'hubballi',
  'dharwad',
  'mangaluru',
  'mangalore',
  'chennai',
  'coimbatore',
  'madurai',
  'tiruchirappalli',
  'salem',
  'tirunelveli',
  'hyderabad',
  'warangal',
  'ahmedabad',
  'surat',
  'vadodara',
  'rajkot',
  'gandhinagar',
  'jaipur',
  'jodhpur',
  'kota',
  'bikaner',
  'ajmer',
  'lucknow',
  'kanpur',
  'varanasi',
  'agra',
  'prayagraj',
  'allahabad',
  'ghaziabad',
  'meerut',
  'bareilly',
  'aligarh',
  'moradabad',
  'patna',
  'gaya',
  'bhagalpur',
  'muzaffarpur',
  'bhopal',
  'indore',
  'gwalior',
  'jabalpur',
  'ujjain',
  'chandigarh',
  'amritsar',
  'jalandhar',
  'patiala',
  'bathinda',
  'kolkata',
  'howrah',
  'asansol',
  'siliguri',
  'durgapur',
  'raipur',
  'bilaspur',
  'durg',
  'bhilai',
  'ranchi',
  'dhanbad',
  'jamshedpur',
  'bhubaneswar',
  'cuttack',
  'rourkela',
  'guwahati',
  'dehradun',
  'haridwar',
  'shimla',
  'srinagar',
  'jammu',
  'visakhapatnam',
  'vijayawada',
  'guntur',
]);

/**
 * Derives an accurate municipal body name based on district and block/city names.
 * Ensures major municipal corporation cities receive "Municipal Corporation" status,
 * while other administrative units receive appropriate Municipality / Panchayat designation.
 */
export function deriveMunicipalBody(district: string, blockOrCity?: string): string {
  const distClean = (district || '').trim();
  const blockClean = (blockOrCity || '').trim();

  // Helper to check if a name matches a major corporation
  const isMajorCorp = (name: string) => {
    if (!name) return false;
    const lower = name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
    if (MAJOR_MUNICIPAL_CORPORATIONS.has(lower)) return true;
    for (const corp of MAJOR_MUNICIPAL_CORPORATIONS) {
      if (lower.includes(corp) || corp.includes(lower)) return true;
    }
    return false;
  };

  // Check block/city first if valid
  if (blockClean && blockClean.toUpperCase() !== 'NA') {
    if (isMajorCorp(blockClean)) {
      return `${blockClean} Municipal Corporation`;
    }
    if (distClean && isMajorCorp(distClean)) {
      return `${distClean} Municipal Corporation`;
    }
    if (distClean && blockClean.toLowerCase() !== distClean.toLowerCase()) {
      return `${blockClean} (${distClean} District)`;
    }
    return `${blockClean} Municipality`;
  }

  // Fallback to district
  if (distClean) {
    if (isMajorCorp(distClean)) {
      return `${distClean} Municipal Corporation`;
    }
    return `${distClean} Municipality / Panchayat`;
  }

  return 'Local Municipal Authority';
}

/**
 * Look up official postal location details via India Post API (https://api.postalpincode.in/pincode/{pin}).
 * Fails gracefully and silently in case of network issues or offline mode.
 */
export async function lookupIndianPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const cleanPin = pincode?.trim() || '';
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return null;
    const block = data[0];

    if (block.Status === 'Success' && Array.isArray(block.PostOffice) && block.PostOffice.length > 0) {
      const first = block.PostOffice[0];
      const stateName = first.State || '';
      const matchedState = findStateByCodeOrName(stateName);

      const postOffices: string[] = block.PostOffice.map((p: any) => p.Name).filter(Boolean);
      const district = first.District || '';
      const blockName = (first.Block && first.Block !== 'NA') ? first.Block : undefined;
      const talukName = (first.Taluk && first.Taluk !== 'NA') ? first.Taluk : undefined;

      return {
        stateName: matchedState?.name || stateName,
        stateIsoCode: matchedState?.isoCode,
        district,
        block: blockName,
        taluk: talukName,
        postOffices,
        division: first.Division || undefined,
        region: first.Region || undefined,
      };
    }
    return null;
  } catch {
    // Fail silently so offline / local mock operations never break
    return null;
  }
}

/**
 * Reverse geocode coordinates to Indian administrative entities using OpenStreetMap Nominatim.
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'CityPulseAI/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    const address = data?.address || {};

    const stateName = address.state || '';
    const matchedState = findStateByCodeOrName(stateName);

    const district =
      address.state_district ||
      address.county ||
      address.district ||
      address.city_district ||
      '';

    const rawCity =
      address.city ||
      address.town ||
      address.municipality ||
      address.suburb ||
      address.village ||
      '';

    const city = rawCity ? deriveMunicipalBody(district, rawCity) : deriveMunicipalBody(district);

    const ward =
      address.suburb ||
      address.neighbourhood ||
      address.residential ||
      address.quarter ||
      address.road ||
      '';

    const pincode = (address.postcode || '').replace(/\D/g, '').slice(0, 6);

    return {
      state: matchedState?.name || stateName,
      stateIsoCode: matchedState?.isoCode,
      district,
      city,
      ward,
      pincode: pincode.length === 6 ? pincode : undefined,
    };
  } catch {
    return null;
  }
}
