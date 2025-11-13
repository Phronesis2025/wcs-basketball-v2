import { fetchPracticeDrills } from "@/lib/actions";
import { PracticeDrill } from "@/types/supabase";
import { sanitizeInput } from "@/lib/security";
import Image from "next/image";
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
} from "@/lib/youtubeUtils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}

const getCategoryColor = (category: string) => {
  const normalizedCategory = category?.trim().toLowerCase();
  if (normalizedCategory === "drill") {
    return "bg-blue-100 text-blue-700";
  } else if (normalizedCategory === "warm-up") {
    return "bg-green-100 text-green-700";
  } else if (normalizedCategory === "conditioning") {
    return "bg-orange-100 text-orange-700";
  } else if (normalizedCategory === "skill development") {
    return "bg-purple-100 text-purple-700";
  } else if (normalizedCategory === "team building") {
    return "bg-yellow-100 text-yellow-700";
  } else {
    return "bg-gray-100 text-gray-700";
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Basic":
      return "bg-gray-100 text-gray-700";
    case "Intermediate":
      return "bg-blue-100 text-blue-700";
    case "Advanced":
      return "bg-orange-100 text-orange-700";
    case "Expert":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default async function DrillPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { print } = await searchParams;
  const isPrint = print === "1";

  // Fetch all drills and find the one matching the ID
  const drills = await fetchPracticeDrills();
  const drill = drills.find((d) => d.id === id);

  if (!drill) {
    notFound();
  }

  return (
    <div
      className={`min-h-screen ${isPrint ? "bg-white p-8" : "bg-navy text-white pt-20 pb-12"}`}
      data-drill-content
    >
      <div className={`container ${isPrint ? "max-w-4xl mx-auto" : "max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8"}`}>
        {/* Header */}
        <div className={`${isPrint ? "mb-6" : "bg-red-600 text-white px-8 pt-8 pb-2 rounded-t-lg mb-0"}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex gap-3 mb-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-inter ${getCategoryColor(
                    drill.category
                  )}`}
                >
                  {drill.category}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-inter ${getDifficultyColor(
                    drill.difficulty
                  )}`}
                >
                  {drill.difficulty}
                </span>
              </div>
              <h2 className={`${isPrint ? "text-4xl" : "text-3xl"} font-bebas font-bold uppercase ${isPrint ? "text-black" : "text-black"}`}>
                {sanitizeInput(drill.title)}
              </h2>
            </div>
          </div>
        </div>

        {/* Key Information */}
        <div className={`${isPrint ? "mb-6" : "p-8 bg-gray-50"}`}>
          <div className="flex flex-row items-start gap-4 md:gap-6 lg:gap-8">
            <div className="flex-1 basis-0">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/images/skill.png"
                  alt="Skills icon"
                  width={20}
                  height={20}
                  className="w-5 h-5 flex-shrink-0"
                />
                <p className="text-sm font-bebas text-gray-600 uppercase whitespace-nowrap">
                  Skills
                </p>
              </div>
              <p className="text-xs font-inter text-gray-900 break-words">
                {drill.skills.join(", ")}
              </p>
            </div>
            <div className="flex-1 basis-0">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/images/equip.png"
                  alt="Equipment icon"
                  width={20}
                  height={20}
                  className="w-5 h-5 flex-shrink-0"
                />
                <p className="text-sm font-bebas text-gray-600 uppercase whitespace-nowrap">
                  Equipment
                </p>
              </div>
              <p className="text-xs font-inter text-gray-900 break-words">
                {drill.equipment.join(", ")}
              </p>
            </div>
            <div className="flex-1 basis-0">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/images/time.png"
                  alt="Duration icon"
                  width={20}
                  height={20}
                  className="w-5 h-5 flex-shrink-0"
                />
                <p className="text-sm font-bebas text-gray-600 uppercase whitespace-nowrap">
                  Duration
                </p>
              </div>
              <p className="text-xs font-inter text-gray-900 break-words">
                {drill.time}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className={`${isPrint ? "mb-6" : "p-6 bg-gray-50"}`}>
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
            <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
              Benefits
            </h3>
          </div>
          <div className="prose max-w-none">
            <p className="text-sm text-gray-700 font-inter leading-relaxed text-left italic">
              {sanitizeInput(drill.benefits)}
            </p>
          </div>
        </div>

        {/* Drill Video - Only show video, not images in PDF */}
        {!isPrint && drill.youtube_url && (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
              <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
                Video
              </h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              {(() => {
                const videoId = extractYouTubeVideoId(drill.youtube_url);
                if (videoId) {
                  const embedUrl = getYouTubeEmbedUrl(videoId);
                  return (
                    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src={embedUrl}
                        title={drill.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  );
                }
                return (
                  <div className="text-center py-8 text-gray-500">
                    Invalid YouTube URL
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={`${isPrint ? "mb-6" : "p-6"}`}>
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
            <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
              Instructions
            </h3>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line text-left">
              {sanitizeInput(drill.instructions)}
            </p>
          </div>
        </div>

        {/* Additional Information */}
        {drill.additional_info && (
          <div className={`${isPrint ? "mb-6" : "p-6"}`}>
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-red-600 mr-3 flex-shrink-0"></div>
              <h3 className="text-2xl font-bebas font-bold text-gray-900 text-left">
                Additional Information
              </h3>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 font-inter leading-relaxed whitespace-pre-line text-left">
                {sanitizeInput(drill.additional_info)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

