"use client";

import PublicHeader from "@/components/PublicHeader";
import Welcome from "./(main)/Welcome";
import AboutUs from "./(main)/AboutUs";
import ContactUs from "./(main)/ContactUs";

export default function Home() {
	return (
		<>
			<PublicHeader />
			<Welcome />
			<AboutUs />
			<ContactUs />
		</>
	);
}
