"use client"

import React, {JSX, useState, useEffect} from 'react';
import './IndexSelector.css'; // Stil dosyasını import ediyoruz

interface IndexSelectorProps {
	professions: string[];
	selectedProfession: string | null; // Dışarıdan gelen seçili profesyon/sektör
	onProfessionSelect: (profession: string | null) => void; // Seçim değiştiğinde çağrılacak fonksiyon
}

export default function IndexSelector({ professions, selectedProfession, onProfessionSelect }: IndexSelectorProps): JSX.Element {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [visibleItems, setVisibleItems] = useState<boolean[]>([]);

	useEffect(() => {
		setVisibleItems(Array(professions.length).fill(false));
		const timers = professions.map((_, index) =>
			setTimeout(() => {
				setVisibleItems(prev => {
					const newVisibleItems = [...prev];
					if (newVisibleItems.length === professions.length) {
						newVisibleItems[index] = true;
					}
					return newVisibleItems;
				});
			}, index * 100)
		);
		return () => {
			timers.forEach(clearTimeout);
		};
	}, [professions]);

	const handleMouseEnter = (index: number): void => {
		setHoveredIndex(index);
	};

	const handleMouseLeave = (): void => {
		setHoveredIndex(null);
	};

	const handleProfessionClick = (profession: string): void => {
		// Eğer zaten seçili olan tekrar tıklanırsa seçimi kaldır, değilse yenisini seç
		if (selectedProfession === profession) {
			onProfessionSelect(null);
		} else {
			onProfessionSelect(profession);
		}
	};

	if (!professions || professions.length === 0) {
		return (
			<div className="index-selector-container">
				<div className="profession-item" style={{width: "auto", paddingRight: "15px"}}>
					<span>Sektörler yükleniyor...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="index-selector-container">
			{professions.map((profession, index) => (
				<div
					key={`${profession}-${index}`}
					className={`profession-item
                    ${hoveredIndex === index ? 'hovered' : ''}
                    ${visibleItems[index] ? 'visible' : ''}
                    ${selectedProfession === profession ? 'selected' : ''} // Seçili öğe için sınıf
                `}
					onMouseEnter={() => handleMouseEnter(index)}
					onMouseLeave={handleMouseLeave}
					onClick={() => handleProfessionClick(profession)} // Tıklama olayı
				>
					<span>{profession}</span>
				</div>
			))}
		</div>
	);
}