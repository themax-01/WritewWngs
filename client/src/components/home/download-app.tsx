import { Button } from '@/components/ui/button';

export default function DownloadApp() {
  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-blue-600 to-violet-500 rounded-2xl shadow-lg overflow-hidden">
        <div className="md:flex items-center">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Take Your Stories Everywhere</h2>
            <p className="text-blue-100 mb-6">Download our mobile app to read and write on the go. Access your favorite stories offline and get notified about new content from authors you follow.</p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button variant="outline" className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition shadow-md border-0">
                <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"></path>
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </Button>
              <Button variant="outline" className="flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition shadow-md border-0">
                <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.69a2.9 2.9 0 0 0 1.897-.667l.009-.007 7.139-3.933.729-.4-8.92-8.92c-.31.36-.55.799-.709 1.287l-.049.18c-.079.357-.122.747-.124 1.135L3 9.5v11.19zm8.498-10.438L20.28 3.5l-2.308 12.731-.046-.025-.359-.193-8.931-4.89 2.862-2.877v1.982zm.729 13.248l7.13-3.916.01-.005a2.899 2.899 0 0 0 1.17-1.394l.045-.122.017-.052a2.915 2.915 0 0 0 .136-.482c.033-.165.05-.334.052-.503V9.499a2.897 2.897 0 0 0-.835-2.118h-.001l-2.555 14.098-5.169-2.868z"></path>
                </svg>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 p-8 md:p-12 flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Mobile app preview" 
              className="rounded-lg shadow-lg max-h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
