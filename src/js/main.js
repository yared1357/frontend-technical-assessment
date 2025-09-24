/** @function enableDragDrop Enables drag and drop functionality with proper item management */
export function enableDragDrop() {
    const originalList = document.getElementById('draggable-list');
    const dropZones = document.querySelectorAll('.drop-zone');
    let draggedItem = null;
    let draggedFromZone = null;

    // Initialize drag functionality for all draggable items
    function initializeDragItem(item) {
        item.setAttribute('draggable', true);
        
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            draggedFromZone = item.parentElement;
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('dragging');
        });

        item.addEventListener('dragend', (e) => {
            item.classList.remove('dragging');
            draggedItem = null;
            draggedFromZone = null;
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            updateDropZoneLayout(item.parentElement);
        });
    }

    const initializeAllDragItems = () => {
        document.querySelectorAll('.draggable-item').forEach(initializeDragItem);
    };
    initializeAllDragItems();

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drag-over');
            updateDropZoneState(zone);
        });

        zone.addEventListener('dragleave', (e) => {
            if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedItem && draggedFromZone !== zone) {
                if (draggedFromZone) draggedFromZone.removeChild(draggedItem);
                draggedItem.classList.add('dropped');
                setTimeout(() => draggedItem.classList.remove('dropped'), 400);
                zone.appendChild(draggedItem);
                updateDropZoneState(zone);
                if (draggedFromZone && draggedFromZone !== originalList) updateDropZoneState(draggedFromZone);
                initializeDragItem(draggedItem);
                updateDropZoneLayout(zone);
            }
        });
    });

    originalList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        originalList.classList.add('drag-over');
    });

    originalList.addEventListener('dragleave', (e) => {
        if (!originalList.contains(e.relatedTarget)) originalList.classList.remove('drag-over');
    });

    originalList.addEventListener('drop', (e) => {
        e.preventDefault();
        originalList.classList.remove('drag-over');
        if (draggedItem && draggedFromZone !== originalList) {
            if (draggedFromZone) draggedFromZone.removeChild(draggedItem);
            draggedItem.classList.add('dropped');
            setTimeout(() => draggedItem.classList.remove('dropped'), 400);
            originalList.appendChild(draggedItem);
            if (draggedFromZone && draggedFromZone !== originalList) updateDropZoneState(draggedFromZone);
            initializeDragItem(draggedItem);
            updateDropZoneLayout(originalList);
        }
    });

    function updateDropZoneState(zone) {
        const items = zone.querySelectorAll('.draggable-item');
        if (items.length > 0) zone.classList.add('has-items');
        else zone.classList.remove('has-items');
    }

    function updateDropZoneLayout(zone) {
        const items = zone.querySelectorAll('.draggable-item');
        if (items.length >= 2 && items.length <= 3) {
            zone.style.display = 'flex';
            zone.style.flexDirection = 'row';
            zone.style.gap = '10px';
            items.forEach(item => {
                item.style.flex = '1';
                item.style.minWidth = '0';
            });
        } else {
            zone.style.display = '';
            zone.style.flexDirection = '';
            zone.style.gap = '';
            items.forEach(item => {
                item.style.flex = '';
                item.style.minWidth = '';
            });
        }
    }

    dropZones.forEach(updateDropZoneState);
    dropZones.forEach(updateDropZoneLayout);
}

/** @function setupNavigation Enables sticky navigation, smooth scrolling, and highlighting */
export function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.nav');
    const headerHeight = header ? header.offsetHeight : 0;

    // Set initial active state
    if (navLinks.length > 0) navLinks[0].classList.add('active');

    // Handle click events for smooth scrolling
    navLinks.forEach(link => {
        link.setAttribute('tabindex', '0');
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor behavior
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                // Calculate scroll position with extra padding to avoid header overlap
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight - 40;

                // Handle Navigation section visibility
                const navigationSection = document.getElementById('navigation');
                if (targetId !== 'navigation' && navigationSection) {
                    navigationSection.classList.add('minimized');
                } else if (targetId === 'navigation' && navigationSection) {
                    navigationSection.classList.remove('minimized');
                }

                // Smooth scroll to target
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });

        // Simplified keyboard navigation
        link.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                link.click(); // Trigger the click event
            }
        });
    });

    // Use IntersectionObserver for section highlighting
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: `-${headerHeight}px 0px 0px 0px`, // Adjust for header height
        threshold: 0.3 // Trigger when 30% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (navLink) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');

                    // Handle Navigation section visibility
                    const navigationSection = document.getElementById('navigation');
                    if (sectionId !== 'navigation' && navigationSection) {
                        navigationSection.classList.add('minimized');
                    } else if (sectionId === 'navigation' && navigationSection) {
                        navigationSection.classList.remove('minimized');
                    }
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => observer.observe(section));

    // Focus handling for accessibility
    navLinks.forEach(link => {
        link.addEventListener('focus', () => {
            link.style.outline = `2px solid var(--secondary-color)`;
            link.style.outlineOffset = '2px';
        });
        link.addEventListener('blur', () => {
            link.style.outline = 'none';
        });
    });
}

/** @function loadBlogs Fetches and displays blogs with filtering and search */
export async function loadBlogs() {
    const blogContainer = document.querySelector('.blog-list-content');
    const filter1 = document.querySelector('#filter1');
    const filter2 = document.querySelector('#filter2');
    const searchInput = document.querySelector('#search');
    
    let allBlogs = [
        {
            "id": 3,
            "title": "Making wearable medical devices more patient-friendly with Professor Esther Rodriguez-Villegas from Acurable",
            "image": "https://techcrunch.com/wp-content/uploads/2022/05/found-2022-featured.jpg?w=430&h=230&crop=1",
            "category": "Health",
            "author": "Darrell Etherington",
            "authorPic": "author1.jpg",
            "published_date": "October 4, 2023",
            "reading_time": "8 minutes",
            "content": "Welcome back to Found, where we get the stories behind the startups. This week, our old friend Darrell Etherington joins Becca Szkutak to talk with Professor Esther Rodriguez-Villegas from Acurable...",
            "tags": ["Biotech", "Health"]
        },
        {
            "id": 4,
            "title": "Rainforest raises $8.5M to help software companies embed financial services, payments",
            "image": "https://techcrunch.com/wp-content/uploads/2015/02/shutterstock_128451140.jpg?w=430&h=230&crop=1",
            "category": "Fintech",
            "author": "Mary Ann Azevedo",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "In November 2019, Andreessen Horowitz General Partner Angela Strange famously declared that, “Every company will be a fintech company.” Specifically, Strange projected that — in the not-too-d...",
            "tags": ["Fintech", "Writing"]
        },
        {
            "id": 5,
            "title": "Pow.bio says biomanufacturing is broken and its continuous fermentation tech will fix it",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Pow-Lab2.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Christine Hall",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Pow.bio intends to bring down the costs associated with biomanufacturing by reimagining of fermentation facility operations.",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 6,
            "title": "Recapitalization, $60M Series D support growth of e-commerce financier Clearco",
            "image": "https://techcrunch.com/wp-content/uploads/2022/07/GettyImages-1314165902.jpg?w=430&h=230&crop=1",
            "category": "Fintech",
            "author": "Christine Hall",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Today is news marks a turnaround for a company that is had its share of ups and downs over the past year.",
            "tags": ["Blogging", "Writing"]
        },
        {
            "id": 7,
            "title": "Rabbit is building an AI model that understands how software works",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1325174870.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Kyle Wiggers",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "What if you could interact with any piece of software using natural language? Imagine typing in a prompt and having AI translate the instructions into machine-comprehendable commands, executing tas...",
            "tags": ["AI", "Writing"]
        },
        {
            "id": 8,
            "title": "Okta plans to weave AI across its entire identity platform using multiple models",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-1350618660.jpg?w=430&h=230&crop=1",
            "category": "Security",
            "author": "Ron Miller",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "One thing is clear this year: generative AI is having a tremendous impact on the software industry, and a week doesn’t pass without software companies announcing their plans to incorporate the seem...",
            "tags": ["Security", "Writing"]
        },
        {
            "id": 9,
            "title": "Yubico can now ship pre-registered security keys to its enterprise users",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/yubikey.jpg?w=430&h=230&crop=1",
            "category": "Enterprise",
            "author": "Frederic Lardinois",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Physical security keys remain one of the best ways to secure user accounts, but the fact that new users have to register them before they can use them often adds quite a bit of friction. Yubico, th...",
            "tags": ["Blogging", "Writing"]
        },
        {
            "id": 10,
            "title": "Resy and Eater co-founder raises $24M for Blackbird, a restaurant loyalty platform",
            "image": "https://techcrunch.com/wp-content/uploads/2022/05/GettyImages-1238043769.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Kyle Wiggers",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "8 minutes",
            "content": "Blackbird Labs, a hospitality tech company whose platform helps restaurants stay in touch with guests and incentivize them to dine out more frequently, today announced that it raised $24 million in...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 11,
            "title": "TC Startup Battlefield master class with Flourish Ventures: Defining early-stage product-market fit",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/battlefield-biotics-ai.jpg?w=430&h=230&crop=1",
            "category": "Growth",
            "author": "Neesha A. Tambe",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
            "tags": ["Growth", "Writing"]
        },
        {
            "id": 12,
            "title": "Yahoo spins out Vespa, its search tech, into an independent company",
            "image": "https://techcrunch.com/wp-content/uploads/2023/02/GettyImages-1242149379.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Kyle Wiggers",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Yahoo, otherwise known as the company that pays my salary (full disclosure: Yahoo owns TC), today announced that it’s spinning off Vespa, the big data serving engine, into an independent vent...",
            "tags": ["AI", "Writing"]
        },
        {
            "id": 13,
            "title": "Okta acquires a16z-backed password manager Uno to develop a personal tier",
            "image": "https://techcrunch.com/wp-content/uploads/2023/03/Uno.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Ivan Mehta",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "5 minutes",
            "content": "Okta, the U.S.-based identity mangement giant, announced today that it has acquired a password mangement app, Uno. The company said that Uno’s team will help speed up the public launch of the...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 14,
            "title": "CoPilot, a training app that matches users with remote fitness coaches, raises $6.5M",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/copilot-screenshots.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Aisha Malik",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "CoPilot, a digital training app that matches users with one-on-one remote fitness coaches, has raised $6.5M in Series A-1 funding led by Jackson Square Ventures. The app, which has seen more than 1...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 15,
            "title": "Opsera, a DevOps platform geared toward enterprises, raises $12M",
            "image": "https://techcrunch.com/wp-content/uploads/2023/08/GettyImages-1439425791-1.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Kyle Wiggers",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Opsera, a DevOps platform geared toward enterprise clients, today announced that it raised $12 million in a funding round — a tranche smaller than Opsera’s previous — led by Taiwa...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 16,
            "title": "EU lawmakers take aim at ‘arbitrary’ decisions by Big Tech in Media Freedom Act vote",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1459166551.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Mainstream social media platforms could face limits on their ability to take down independent journalism that violates their terms and conditions under a proposal agreed by European Union lawmakers...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 17,
            "title": "Make these 5 changes to avoid becoming the next cybersecurity headline",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-1455969376.jpg?w=430&h=230&crop=1",
            "category": "Work",
            "author": "Jim Broome",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Recent incidents, such as the breach at MGM Resorts, serve as stark reminders of the potential consequences of inadequate security measures.",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 18,
            "title": "Uber expands its peer-to-peer package delivery service",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-1455969376.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Rebecca Bellan",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Uber is expanding its peer-to-peer package delivery service, Uber Connect. Now, customers who don’t want to schlep a package to the post office can request an Uber courier to do it for them w...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 19,
            "title": "Open Banking led to a FinTech boom — As Brite raises $60M, account-to-account payment grows",
            "image": "https://techcrunch.com/wp-content/uploads/2023/04/hero-option-2-1.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Mike Butcher",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The move towards Open Banking payments, especially in the EU, effectively kicked-off the FinTech boom. Open Baking standards meant that FinTech startups could create Wallets and effectively become ...",
            "tags": ["Apps", "Writing"]
        },
        {
            "id": 20,
            "title": "Krafton India launches gaming incubator to expand local ecosystem",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/krafton-india-ceo-sean-hyunil-sohn.jpeg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Jagmeet Singh",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The move towards Open Banking payments, especially in the EU, effectively kicked-off the FinTech boom. Open Baking standards meant that FinTech startups could create Wallets and effectively become ...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 21,
            "title": "Electric Hydrogen is the green hydrogen industry’s first unicorn",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Small-cell-Testing-in-EH2-Natick-Accelerated-Lifetime-Testing-Facility-2.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Rebecca Bellan",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Investors have historically been skeptical of green hydrogen. High production costs, expensive infrastructure builds, competition with batteries and minimal government support have made the green h...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 22,
            "title": "In latest Cruise incident, video shows pedestrian struck by human-driven car, then run over by robotaxi",
            "image": "https://techcrunch.com/wp-content/uploads/2022/10/Cruise_700848.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Rebecca Bellan",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The San Francisco Police Department is investigating an October 2 incident that left a woman stuck underneath a Cruise robotaxi after being hit by a human-driven vehicle. Video captured by Cruise a...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 23,
            "title": "Spotify to include a selection of 150K audiobooks with its Premium subscription",
            "image": "https://techcrunch.com/wp-content/uploads/2022/10/Cruise_700848.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Spotify today unveiled what’s next for the future of its audiobooks service. At an event hosted in its New York offices on Tuesday afternoon, the company announced a new business model where",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 24,
            "title": "How an AI deepfake ad of MrBeast ended up on TikTok",
            "image": "https://techcrunch.com/wp-content/uploads/2021/12/mrbeast-squid-game-remake-1.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "AI deepfake today unveiled what’s next for the future of its audiobooks service. At an event hosted in its New York offices on Tuesday afternoon, the company announced a new business model where",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 25,
            "title": "You can now add PayPal and Venmo credit or debit cards to your Apple Wallet",
            "image": "https://techcrunch.com/wp-content/uploads/2021/12/mrbeast-squid-game-remake-1.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "PayPal announced today that users can now add their PayPal and Venmo credit or debit cards to their Apple Wallet. With this new integration, you can now make payments in-store, online or on apps using Apple Pay. The company notes that users will continue earning their cashback and rewards.",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 26,
            "title": "The Xencelabs Pen Display 24 is a terrific alternative to Wacom’s big-screen drawing tablets",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Xencelabs-Pen-Display-24-6.jpg?w=430&h=230&crop=1",
            "category": "Gadgets",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Xencelabs announced today that users can now add their Xencelabs and Venmo credit or debit cards to their Apple Wallet. With this new integration, you can now make payments in-store, online or on apps using Apple Pay. The company notes that users will continue earning their cashback and rewards.",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 27,
            "title": "US lawmakers ask TikTok about its ByteDance ties after recent exec transfers between the companies",
            "image": "https://techcrunch.com/wp-content/uploads/2019/11/GettyImages-1177990253.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Xencelabs announced today that users can now add their Xencelabs and Venmo credit or debit cards to their Apple Wallet. With this new integration, you can now make payments in-store, online or on apps using Apple Pay. The company notes that users will continue earning their cashback and rewards.",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 28,
            "title": "Sam Altman backs teens’ AI startup automating browser-native workflows",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/induced-ai.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "Xencelabs announced today that users can now add their Xencelabs and Venmo credit or debit cards to their Apple Wallet. With this new integration, you can now make payments in-store, online or on apps using Apple Pay. The company notes that users will continue earning their cashback and rewards.",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 29,
            "title": "Arc browser’s new AI-powered features combine OpenAI and Anthropic’s models",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Screenshot-2023-10-03-at-10.16.25-PM.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 30,
            "title": "Promova’s new feature helps people with dyslexia learn a new language",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/2.png?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 31,
            "title": "Don’t sweat the valuation headlines, ByteDance is doing great",
            "image": "https://techcrunch.com/wp-content/uploads/2023/03/GettyImages-1248389907.jpg?w=430&h=230&crop=1",
            "category": "Work",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 32,
            "title": "PlanetScale forks MySQL to add vector support",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-1244811487.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 33,
            "title": "Osmoses gets $11M seed to bring its molecule-scale membranes to the hydrogen market",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/osmoses-production-line.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Tim De Chant",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 34,
            "title": "SBF’s trial has started, this is how he and FTX got here",
            "image": "https://techcrunch.com/wp-content/uploads/2023/01/GettyImages-1454050629.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Tim De Chant",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 35,
            "title": "Qobra raises $10.5 million for its real-time sales compensation tool",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Qobra-founders.jpeg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Tim De Chant",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 36,
            "title": "FBI most-wanted Russian hacker reveals why he burned his passport",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/mikhail-matveev-ransomware-most-wanted.png?w=430&h=230&crop=1",
            "category": "Security",
            "author": "Tim De Chant",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 37,
            "title": "Motel One says ransomware gang stole customer credit card data",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/MO-Hotel-Hamburg-am-Michel-Outdoor-3.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Carly Page",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 38,
            "title": "LinkedIn goes big on new AI tools for learning, recruitment, marketing and sales, powered by OpenAI",
            "image": "https://techcrunch.com/wp-content/uploads/2022/11/GettyImages-1244671434-e1669291782949.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Carly Page",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 39,
            "title": "Dry Studio’s Black Diamond 75 is a gaming keyboard that actually looks good",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/15.jpg?w=430&h=230&crop=1",
            "category": "Gadgets",
            "author": "Carly Page",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 40,
            "title": "DoorDash tests a feature that rewards users for dining out, not ordering in",
            "image": "https://techcrunch.com/wp-content/uploads/2022/08/GettyImages-1232015093.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Carly Page",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 41,
            "title": "Adapting to a world with higher interest rates — a guide for startups",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-109439584.jpg?w=430&h=230&crop=1",
            "category": "Work",
            "author": "Mohit Agarwal",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 42,
            "title": "Wattpad ditches ‘Paid Stories’ for a freemium model",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/wattpad-logo.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Mohit Agarwal",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 43,
            "title": "Science lab automation and robotics startup Automata raises $40M",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/05_LINQ-BENCH_LAB_QUAD_BLUE-2-1536x864-copy-e1696332783997.png?w=430&h=230&crop=1",
            "category": "Health",
            "author": "Mohit Agarwal",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 44,
            "title": "Meta planning ad-free subscription or tracking ads ‘choice’ in EU, per WSJ — in latest bid to keep snooping",
            "image": "https://techcrunch.com/wp-content/uploads/2021/11/facebook-meta-surveillance-1.jpg?w=430&h=230&crop=1",
            "category": "Security",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 45,
            "title": "Sparx wants to do for enterprise what Truebill did for consumer recurring bills",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/SaaS-final.png?w=430&h=230&crop=1",
            "category": "Fintech",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 46,
            "title": "Ten Key Labs wants to simplify managing equity for startups",
            "image": "https://techcrunch.com/wp-content/uploads/2022/09/GettyImages-1359478309.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 47,
            "title": "HCVC is back with a new $75 million deep tech fund",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/HCVC-team.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 48,
            "title": "Cloaked manages your logins with proxy emails, phone numbers and a built-in password manager",
            "image": "https://techcrunch.com/wp-content/uploads/2023/09/Cloaked-Privacy-2.jpeg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 49,
            "title": "Unitary AI picks up $15M for its multimodal approach to video content moderation",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/Screenshot-2023-10-03-at-01.44.37.png?w=430&h=230&crop=1",
            "category": "Health",
            "author": "Natasha Lomas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 50,
            "title": "Veev’s demise a warning for proptech, construction tech",
            "image": "https://techcrunch.com/wp-content/uploads/2023/10/GettyImages-1454251424.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Natasha Mascarenhas",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 51,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Christine Hall",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 52,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Haje Jan Kamps",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 53,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Sarah Perez",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 54,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Manish Singh",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 55,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Security",
            "author": "Brian Heater",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 56,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Gadgets",
            "author": "Darrell Etherington",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 57,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Fintech",
            "author": "Mary Ann Azevedo",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 58,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Enterprise",
            "author": "Frederic Lardinois",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 59,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Health",
            "author": "Christine Hall",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 60,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Work",
            "author": "Ron Miller",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 61,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Growth",
            "author": "Kyle Wiggers",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 62,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "AI",
            "author": "Ivan Mehta",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 63,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Apps",
            "author": "Aisha Malik",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 64,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Tech",
            "author": "Rebecca Bellan",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        },
        {
            "id": 65,
            "title": "Daily Crunch: OpenAI’s GPT-4o can now detect emotions — whether you like it or not",
            "image": "https://techcrunch.com/wp-content/uploads/2023/05/GettyImages-1252913572.jpg?w=430&h=230&crop=1",
            "category": "Startups",
            "author": "Jagmeet Singh",
            "authorPic": "author1.jpg",
            "published_date": "2023-10-01",
            "reading_time": "6 minutes",
            "content": "The Arc browser is “finally” launching its AI-powered features under the “Arc Max” moniker. The Browser Company is using a combination of OpenAI’s GPT-3.5 and Anthropi...",
            "tags": ["Startups", "Writing"]
        }
    ];

    function displayBlogs(blogs) {
        blogContainer.innerHTML = blogs.length === 0 ? '<p class="error">No blogs found.</p>' : '';
        blogs.forEach(blog => {
            const blogItem = document.createElement('div');
            blogItem.classList.add('blog-item');
            blogItem.innerHTML = `
                <img src="${blog.image}" alt="${blog.title}" class="blog-image">
                <div class="blog-content">
                    <h3 class="blog-title">${blog.title}</h3>
                    <div class="blog-card-meta">
                        <p>By ${blog.author} | ${blog.published_date} | ${blog.reading_time}</p>
                        <p>Category: ${blog.category}</p>
                    </div>
                    <div class="blog-tags">
                        ${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                    <p class="blog-content-text">${blog.content.substring(0, 100)}...</p>
                </div>
            `;
            blogContainer.appendChild(blogItem);
        });
    }

    function filterAndSortBlogs() {
        let filteredBlogs = [...allBlogs];
        
        // Category filter
        const category = filter2.value.toLowerCase();
        if (category !== 'all') {
            filteredBlogs = filteredBlogs.filter(blog => blog.category.toLowerCase() === category);
        }
        
        // Search filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredBlogs = filteredBlogs.filter(blog => blog.title.toLowerCase().includes(searchTerm));
        }
        
        // Sort
        const sortBy = filter1.value;
        filteredBlogs.sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.published_date) - new Date(a.published_date);
            } else if (sortBy === 'readingTime') {
                return parseInt(b.reading_time) - parseInt(a.reading_time);
            } else if (sortBy === 'category') {
                return a.category.localeCompare(b.category);
            }
            return 0;
        });
        
        displayBlogs(filteredBlogs);
    }

    // Event listeners for filters and search
    filter1.addEventListener('change', filterAndSortBlogs);
    filter2.addEventListener('change', filterAndSortBlogs);
    searchInput.addEventListener('input', filterAndSortBlogs);
    
    // Initial display
    displayBlogs(allBlogs);
}

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    enableDragDrop();
    loadBlogs();
    setupNavigation();
});