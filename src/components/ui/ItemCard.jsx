import { Star, MapPin } from "lucide-react"
import { Card } from "./Buttons"
import { getItemImageSrc } from "./helpers"

export default function ItemCard({ item, onClick }) {
  const imageSrc = getItemImageSrc(item)
  const available = item.available ?? item.avail ?? true

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div onClick={() => onClick?.(item)}>
        <div className="h-44 bg-linear-to-br from-orange-50 to-amber-50 flex items-center justify-center relative">
          {imageSrc ? (
            <img src={imageSrc} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl group-hover:scale-110 transition-transform">{item.emoji || "📦"}</span>
          )}
          {!available && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="bg-stone-800 text-white text-xs font-bold px-3 py-1 rounded-full">Unavailable</span>
            </div>
          )}
          {item.category && (
            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full text-stone-600 border border-stone-100">
              {item.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-stone-900 truncate">{item.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-stone-400" />
            <span className="text-xs text-stone-500">{item.location}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-lg font-bold text-orange-600">RM {item.price}</span>
              <span className="text-xs text-stone-400">/day</span>
            </div>
            {item.rating != null && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-stone-600">{item.rating}</span>
                <span className="text-xs text-stone-400">({item.reviews})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
