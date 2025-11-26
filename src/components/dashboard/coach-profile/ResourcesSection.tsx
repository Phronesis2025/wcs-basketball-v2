// src/components/dashboard/coach-profile/ResourcesSection.tsx
import React from "react";
import ResourceCard from "../ResourceCard";
import BasketballLoader from "../../BasketballLoader";
import { ResourcesData, ResourceItem } from "./hooks/useResources";

interface ResourcesSectionProps {
  resourcesData: ResourcesData | null;
  resourcesLoading: boolean;
  isAdmin: boolean;
  onShowUploadModal: () => void;
  onShowTeamLogoModal: () => void;
  onShowClubLogoModal: () => void;
  onResourceClick: (
    url: string,
    name: string,
    fileName: string,
    type: "image" | "document",
    size?: number,
    displayName?: string,
    bucket?: string,
    path?: string
  ) => void;
}

export default function ResourcesSection({
  resourcesData,
  resourcesLoading,
  isAdmin,
  onShowUploadModal,
  onShowTeamLogoModal,
  onShowClubLogoModal,
  onResourceClick,
}: ResourcesSectionProps) {
  if (resourcesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BasketballLoader size={60} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white font-inter">
          Resources & Tools
        </h3>
      </div>

      <div className="space-y-8">
        {/* Documents Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-white font-inter">
              Documents
            </h4>
            {isAdmin && (
              <button
                onClick={onShowUploadModal}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter text-sm rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                + Upload
              </button>
            )}
          </div>
          {resourcesData?.documents && resourcesData.documents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {resourcesData.documents.map((doc) => (
                <ResourceCard
                  key={doc.path}
                  name={doc.name}
                  url={doc.url}
                  size={doc.size}
                  type="document"
                  onClick={() =>
                    onResourceClick(
                      doc.url,
                      doc.name,
                      doc.name,
                      "document",
                      doc.size,
                      undefined,
                      "resources",
                      doc.path
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400 font-inter">
                No documents available
              </p>
            </div>
          )}
        </div>

        {/* Team Logos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-white font-inter">
              Team Logos
            </h4>
            {isAdmin && (
              <button
                onClick={onShowTeamLogoModal}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter text-sm rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                + Upload
              </button>
            )}
          </div>
          {resourcesData?.teamLogos && resourcesData.teamLogos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {resourcesData.teamLogos.map((logo) => (
                <ResourceCard
                  key={logo.path}
                  name={logo.name}
                  url={logo.url}
                  size={logo.size}
                  teamName={logo.teamName}
                  type="image"
                  onClick={() =>
                    onResourceClick(
                      logo.url,
                      logo.teamName || logo.name,
                      logo.name,
                      "image",
                      logo.size,
                      logo.teamName,
                      "images",
                      logo.path
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400 font-inter">
                No team logos available
              </p>
            </div>
          )}
        </div>

        {/* Club Logos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-white font-inter">
              Club Logos
            </h4>
            {isAdmin && (
              <button
                onClick={onShowClubLogoModal}
                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-inter text-sm rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                + Upload
              </button>
            )}
          </div>
          {resourcesData?.clubLogos && resourcesData.clubLogos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {resourcesData.clubLogos.map((logo) => (
                <ResourceCard
                  key={logo.path}
                  name={logo.name}
                  url={logo.url}
                  size={logo.size}
                  type="image"
                  onClick={() =>
                    onResourceClick(
                      logo.url,
                      logo.name,
                      logo.name,
                      "image",
                      logo.size,
                      undefined,
                      "images",
                      logo.path
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-slate-400 font-inter">
                No club logos available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

