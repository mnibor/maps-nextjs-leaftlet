import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
	onMapReady: (map: L.Map, L: typeof L) => void
}

const MapComponent: React.FC<MapComponentProps> = ({ onMapReady }) => {
	const mapRef = useRef<L.Map | null>(null)

	useEffect(() => {
		// Configurar el icono por defecto
		delete L.Icon.Default.prototype._getIconUrl
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: '/images/marker-icon-2x.png',
			iconUrl: '/images/marker-icon.png',
			shadowUrl: '/images/marker-shadow.png',
		})

		if (!mapRef.current) {
			const map = L.map('map', {
				center: [0, 0],
				zoom: 2,
				zoomControl: false, // Desactivar el control de zoom predeterminado
			})

			L.control
				.zoom({
					position: 'bottomright', // Posicionar el control de zoom en la esquina inferior derecha
				})
				.addTo(map)

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
				subdomains: ['a', 'b', 'c'],
			}).addTo(map)

			mapRef.current = map
			onMapReady(map, L)
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.remove()
				mapRef.current = null
			}
		}
	}, [onMapReady])

	return <div id='map' style={{ height: '600px', width: '100%' }}></div>
}

export default MapComponent
