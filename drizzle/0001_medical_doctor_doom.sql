ALTER TABLE "siteContent" ALTER COLUMN "phone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "siteContent" ALTER COLUMN "whatsapp" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "siteContent" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "siteContent" ALTER COLUMN "logoImage" SET DEFAULT '/images/logo.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ALTER COLUMN "logoImage" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityImage1" text DEFAULT '/images/hero-quarry.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityImage2" text DEFAULT '/images/craft-cutting.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityImage3" text DEFAULT '/images/slabs-warehouse.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityImage4" text DEFAULT '/images/monument-headstone.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityImage5" text DEFAULT '/images/vases-collection.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityTitle" varchar(240) DEFAULT 'From Quarry to Container';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facilityCopy" text DEFAULT 'A state-of-the-art facility with advanced machinery and a skilled team, ensuring precision at every stage.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "bannerImage" text DEFAULT '/images/monument-headstone.jpg';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "mapsUrl" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "googleSheetUrl" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "productsEyebrow" text DEFAULT 'OUR PRODUCTS';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "productsTitle" text DEFAULT 'Crafted for Lasting Impressions';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "productsCopy" text DEFAULT 'From monumental structures to elegant accessories, our granite products are designed to meet the highest standards of quality and durability.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "collectionsEyebrow" text DEFAULT 'STONE COLLECTION';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "collectionsTitle" text DEFAULT 'Nature''s Beauty. In Every Shade.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "collectionsCopy" text DEFAULT 'Explore our premium range of granite stones, known for their unique patterns, colours and durability.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "finishesEyebrow" text DEFAULT 'SURFACE FINISHINGS';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "finishesTitle" text DEFAULT 'The Art of Every Surface.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "finishesCopy" text DEFAULT 'From mirror-polished luxury to rugged flamed textures — each finish transforms stone into a distinct architectural statement.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyChooseEyebrow" text DEFAULT 'WHY SV GRANITES';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyChooseTitle" text DEFAULT 'The Right Partner for Your Stone Needs.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature1Title" text DEFAULT 'Direct Manufacturing';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature1Desc" text DEFAULT 'Work directly with the source.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature2Title" text DEFAULT 'Consistent Quality';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature2Desc" text DEFAULT 'Material and finish checked before dispatch.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature3Title" text DEFAULT 'Custom Production';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature3Desc" text DEFAULT 'Tailored to your requirements.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature4Title" text DEFAULT 'Export Packaging';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature4Desc" text DEFAULT 'Safe for international transport.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature5Title" text DEFAULT 'Responsive Communication';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature5Desc" text DEFAULT 'Clear coordination from enquiry to shipment.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature6Title" text DEFAULT 'Long-Term Partnerships';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whyFeature6Desc" text DEFAULT 'Built on trust and reliability.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "globalReachEyebrow" text DEFAULT 'GLOBAL REACH';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "globalReachTitle" text DEFAULT 'FROM INDIA, MADE FOR THE WORLD.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "globalReachCopy" text DEFAULT 'Manufactured in South India · Prepared for international buyers.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "galleryEyebrow" text DEFAULT 'GALLERY';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "galleryTitle" text DEFAULT 'Stone in Every Frame.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "enquiryTitle" text DEFAULT 'LOOKING FOR THE RIGHT STONE?';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "enquiryCopy" text DEFAULT 'Tell us what you''re looking for. We''ll help you find the right material, finish and specification.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "bannerTitle" text DEFAULT 'STONE THAT LASTS. PARTNERSHIPS THAT GROW.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "bannerSubtitle" text DEFAULT 'South India · India';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric1Val" text DEFAULT '25+';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric1Label" text DEFAULT 'Years of Experience';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric2Val" text DEFAULT 'Export Ready';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric2Label" text DEFAULT 'International Packaging';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric3Val" text DEFAULT 'Quality Focused';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric3Label" text DEFAULT 'Every Order Inspected';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric4Val" text DEFAULT 'Direct Manufacturer';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "metric4Label" text DEFAULT 'From India';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "footerCopy" text DEFAULT 'All rights reserved.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "whatsappTemplate" text DEFAULT 'Hello SV Granites, I visited your website and would like to enquire about your granite products and export pricing.';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "emailSubjectTemplate" text DEFAULT 'Enquiry regarding Granite Products & Supply - SV Granites';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "emailBodyTemplate" text DEFAULT 'Dear SV Granites Team,

I visited your website and would like to enquire regarding your natural stone collection and pricing.

Project details:

Thank you!';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "facebookUrl" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "instagramUrl" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "youtubeUrl" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "siteContent" ADD COLUMN "linkedinUrl" text DEFAULT '';