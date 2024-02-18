import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import InfiniteScroll from "react-infinite-scroll-component"
import LoadingSpin from "react-loading-spin"
import useDocumentTitle from "../../Hooks/useDocumentTitle"
import { Link } from "react-router-dom"
import { API, COLORLIST } from "../../constants"
import Image from "../../Components/Content/Image"

const PAGE_NUMBER = 1

function AnimeBrowseMoreENG({ urlString, urlTitle }) {
	const [loading, setLoading] = useState(true)
	const [allAnime, setAllAnime] = useState([])
	let [page, setPage] = useState(PAGE_NUMBER)
	const [hasNextPage, setHasNextPage] = useState(true)
	const { query } = useParams()
	const isLoadingRef = useRef(false)
	const [error, setError] = useState(null)
	const [randomColor, setRandomColor] = useState("#fffc")
	useEffect(() => {
		const CancelToken = axios.CancelToken
		const source = CancelToken.source()
		const getAnimeBrowse = async () => {
			if (isLoadingRef.current) return
			isLoadingRef.current = true
			setError(null)

			axios
				.get(`${API}/eng/${urlString}?page=${page}`, {
					cancelToken: source.token,
				})
				.then((response) => {
					if (response.data.success) {
						setAllAnime((prev) => {
							return [...new Set([...prev, ...response.data.data.results])]
						})
						setHasNextPage(response.data.data.hasNextPage)
					} else {
						setHasNextPage(false)
					}
				})
				.catch((thrown) => {
					if (axios.isCancel(thrown)) return
					setError(thrown)
				})
				.finally(() => {
					isLoadingRef.current = false // Reset loading state
					setLoading(false)
				})
		}

		getAnimeBrowse()

		return () => {
			source.cancel()
		}
	}, [page, query, urlString])

	useEffect(() => {
		const getRandomColor =
			COLORLIST[Math.floor(Math.random() * COLORLIST.length)]
		setRandomColor(getRandomColor)
	}, [])

	const scrollThreshold = () => {
		if (!loading && !error) {
			const newPage = page + 1
			setPage(newPage)
		}
	}

	useDocumentTitle(`${urlTitle} - Unime`)
	return (
		<div>
			<h1
				className="font-black font-bebas-neue text-center"
				style={{
					color: randomColor,
				}}
			>
				{urlTitle}
			</h1>
			{loading ? (
				<div className="block w-full mt-[50px] text-center">
					<LoadingSpin primaryColor="red" />
				</div>
			) : (
				<InfiniteScroll
					initialScrollY={0}
					style={{ overflow: "none" }}
					dataLength={allAnime.length}
					scrollThreshold={0.9}
					next={scrollThreshold}
					hasMore={hasNextPage}
					loader={
						<div className="loading-spin mt-0">
							<LoadingSpin primaryColor="red" />
						</div>
					}
				>
					<div className="anime-container md:px-12 lg:px-20 xl:px-28 2xl:px-36 w-full pb-12 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
						{allAnime.map((item, i) => (
							<Link
								to={`/eng/info/${item.id}`}
								title={
									item.title?.english ||
									item.title?.romaji ||
									item.title?.native ||
									item.title?.userPreferred
								}
								aria-label={
									item.title?.english ||
									item.title?.romaji ||
									item.title?.native ||
									item.title?.userPreferred
								}
								key={i}
								className="group col-span-1 cursor-pointer flex flex-col items-center mb-[12px] relative float-left"
							>
								<div className="group-hover:opacity-70 anime-item-image relative aspect-w-2 aspect-h-3 duration-300 ease-linear pb-[156%] mb-0 w-full overflow-hidden">
									<Image
										className="object-fit absolute w-100 min-h-full duration-500 ease-in-out"
										src={
											item.image ||
											item.coverImage?.extraLarge ||
											item.coverImage?.large ||
											item.coverImage?.medium ||
											""
										}
										alt={
											item.title?.english ||
											item.title?.romaji ||
											item.title?.native ||
											item.title?.userPreferred
										}
										loading="lazy"
									/>
									{item.episodeNumber && (
										<div className="z-10 absolute right-0 bg-black/80 p-[4px] text-[#fffc]">
											EP. {item.episodeNumber}
										</div>
									)}
								</div>
								<div className="anime-item-title h-[60px] w-full mt-[4px]">
									<p
										className="line-clamp-2 px-[4px] text-base font-semibold"
										style={{
											color: item.coverImage?.color || item?.color || "#fffc",
										}}
									>
										{item.title?.english ||
											item.title?.romaji ||
											item.title?.native ||
											item.title?.userPreferred}
									</p>
								</div>
							</Link>
						))}
					</div>
				</InfiniteScroll>
			)}
		</div>
	)
}

export default AnimeBrowseMoreENG
