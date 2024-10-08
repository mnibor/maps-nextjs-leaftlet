'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { LatLng, Map as LeafletMap } from 'leaflet'

const MapComponent = dynamic(() => import('./MapComponent'), {
	loading: () => <p>Cargando mapa...</p>,
	ssr: false,
})

const Map = () => {
	const [distance, setDistance] = useState<number | null>(null)
	const mapRef = useRef<LeafletMap | null>(null)
	const [points, setPoints] = useState<[LatLng | null, LatLng | null]>([
		null,
		null,
	])
	const [markers, setMarkers] = useState<[L.Marker | null, L.Marker | null]>([
		null,
		null,
	])

	const handleMapClick = useCallback(
		(e: { latlng: LatLng }, L: any, map: LeafletMap) => {
			const { lat, lng } = e.latlng

			const addMarker = (index: number) => {
				const newMarker = L.marker([lat, lng])
					.addTo(map)
					.bindPopup(`Punto ${index + 1}`)
					.openPopup()
				setMarkers((prevMarkers) => {
					const updatedMarkers = [...prevMarkers]
					updatedMarkers[index] = newMarker
					return updatedMarkers
				})
			}

			setPoints((prevPoints) => {
				const newPoints = [...prevPoints]
				if (newPoints[0] === null) {
					newPoints[0] = e.latlng
					addMarker(0)
				} else if (newPoints[1] === null) {
					newPoints[1] = e.latlng
					addMarker(1)
					calculateDistance(newPoints)
				}
				return newPoints
			})
		},
		[]
	)

	const calculateDistance = useCallback(
		(points: [LatLng | null, LatLng | null]) => {
			const [point1, point2] = points
			if (point1 && point2) {
				import('geolib').then(({ getDistance }) => {
					const distanceInMeters = getDistance(
						{ latitude: point1.lat, longitude: point1.lng },
						{ latitude: point2.lat, longitude: point2.lng }
					)
					setDistance(distanceInMeters / 1000) // Convert to kilometers
				})
			}
		},
		[]
	)

	const onMapReady = useCallback(
		(map: LeafletMap, L: any) => {
			mapRef.current = map
			map.on('click', (e) => handleMapClick(e, L, map))

			// Centrar el mapa en la ubicación del usuario
			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						const { latitude, longitude } = position.coords
						map.setView([latitude, longitude], 13)
					},
					(error) => {
						console.error('Error getting location:', error)
					}
				)
			}
		},
		[handleMapClick]
	)

	const handleNewQuery = useCallback(() => {
		const map = mapRef.current
		if (!map) return

		markers.forEach((marker) => {
			if (marker) {
				map.removeLayer(marker)
			}
		})

		setMarkers([null, null])
		setPoints([null, null])
		setDistance(null)

		// Restablecer la vista del mapa
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords
					map.setView([latitude, longitude], 13)
				},
				() => {
					// Si falla la geolocalización, usar una vista predeterminada
					map.setView([0, 0], 2)
				}
			)
		} else {
			map.setView([0, 0], 2)
		}
	}, [])

	return (
		<div>
			<MapComponent onMapReady={onMapReady} />
			{distance !== null && (
				<div>
					<p>Distancia entre los puntos: {distance.toFixed(2)} km</p>
					<button onClick={handleNewQuery}>Nueva consulta</button>
				</div>
			)}
		</div>
	)
}

export default Map
