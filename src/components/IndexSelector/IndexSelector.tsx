"use client"

import React, {JSX, useState, useEffect} from 'react';
import './IndexSelector.css'; // Stil dosyasını import ediyoruz

const professions: string[] = [
	"Mühendislik Fakültesi Dekanlığı",
	"Tıp Doktoru",
	"Kıdemli Öğretmen",
	"Ceza Avukatı",
	"Baş Mimar",
	"Yoğun Bakım Hemşiresi",
	"Usta Berber",
	"Yazılım Geliştirme Uzmanı",
	"Kreatif Grafik Tasarımcı",
	"Araştırmacı Gazeteci ve Yazar",
	"Mühendislik Fakültesi Dekanlığı",
	"Tıp Doktoru",
	"Kıdemli Öğretmen",
	"Ceza Avukatı",
	"Baş Mimar",
	"Yoğun Bakım Hemşiresi",
	"Usta Berber",
	"Yazılım Geliştirme Uzmanı",
	"Kreatif Grafik Tasarımcı",
	"Araştırmacı Gazeteci ve Yazar"
];

export default function IndexSelector(): JSX.Element {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(professions.length).fill(false));

	const handleMouseEnter = (index: number): void => {
		setHoveredIndex(index);
	};

	const handleMouseLeave = (): void => {
		setHoveredIndex(null);
	};

	useEffect(() => {
		professions.forEach((_, index) => {
			setTimeout(() => {
				setVisibleItems(prev => {
					const newVisibleItems = [...prev];
					newVisibleItems[index] = true;
					return newVisibleItems;
				});
			}, index * 100); 
		});
	}, []); 

	return (
		<div className="index-selector-container">
			{professions.map((profession, index) => (
				<div
					key={index}
					className={`profession-item ${hoveredIndex === index ? 'hovered' : ''} ${visibleItems[index] ? 'visible' : ''}`}
					onMouseEnter={() => handleMouseEnter(index)}
					onMouseLeave={handleMouseLeave}
				>
					<span>{profession}</span>
				</div>
			))}
		</div>
	);
}